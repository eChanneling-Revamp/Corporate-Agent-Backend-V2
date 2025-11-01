import { prisma } from '@/config/prisma';
import { AppError } from '@/middleware/errorHandler';
import { ResponseUtils } from '@/utils/response';
import {
  SearchDoctorsQuery,
  CreateDoctorInput,
  UpdateDoctorInput,
  GetAvailableSlotsQuery,
} from './doctor.validation';

export class DoctorService {
  /**
   * Search doctors with filters and pagination
   */
  static async searchDoctors(query: SearchDoctorsQuery) {
    const {
      page = 1,
      limit = 10,
      search,
      specialty,
      hospital,
      availableDate,
      minFee,
      maxFee,
      minRating,
      sortBy = 'name',
      sortOrder = 'asc',
    } = query;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { specialty: { contains: search, mode: 'insensitive' } },
        { hospital: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (specialty) {
      where.specialty = { contains: specialty, mode: 'insensitive' };
    }

    if (hospital) {
      where.hospital = { contains: hospital, mode: 'insensitive' };
    }

    if (minFee !== undefined || maxFee !== undefined) {
      where.consultationFee = {};
      if (minFee !== undefined) where.consultationFee.gte = minFee;
      if (maxFee !== undefined) where.consultationFee.lte = maxFee;
    }

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    // Calculate pagination
    const skip = ResponseUtils.getPaginationSkip(page, limit);

    // Get doctors with pagination
    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          _count: {
            select: {
              appointments: true,
            },
          },
        },
      }),
      prisma.doctor.count({ where }),
    ]);

    const pagination = ResponseUtils.calculatePagination(page, limit, total);

    return {
      doctors,
      pagination,
    };
  }

  /**
   * Get doctor by ID
   */
  static async getDoctorById(doctorId: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        _count: {
          select: {
            appointments: {
              where: {
                status: 'COMPLETED',
              },
            },
          },
        },
        appointments: {
          where: {
            status: 'CONFIRMED',
            date: {
              gte: new Date(),
            },
          },
          take: 5,
          orderBy: {
            date: 'asc',
          },
          select: {
            id: true,
            date: true,
            timeSlot: true,
            patientName: true,
            status: true,
          },
        },
      },
    });

    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    return doctor;
  }

  /**
   * Create new doctor (admin only)
   */
  static async createDoctor(data: CreateDoctorInput) {
    const doctor = await prisma.doctor.create({
      data: {
        ...data,
        availableDates: data.availableDates || [],
      },
    });

    return doctor;
  }

  /**
   * Update doctor (admin only)
   */
  static async updateDoctor(doctorId: string, data: UpdateDoctorInput) {
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!existingDoctor) {
      throw new AppError('Doctor not found', 404);
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return updatedDoctor;
  }

  /**
   * Delete doctor (admin only - soft delete)
   */
  static async deleteDoctor(doctorId: string) {
    const existingDoctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!existingDoctor) {
      throw new AppError('Doctor not found', 404);
    }

    // Check if doctor has any future appointments
    const futureAppointments = await prisma.appointment.count({
      where: {
        doctorId,
        date: {
          gte: new Date(),
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    if (futureAppointments > 0) {
      throw new AppError(
        'Cannot delete doctor with future appointments. Please cancel or reschedule existing appointments first.',
        400
      );
    }

    const deletedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: { isActive: false },
    });

    return { message: 'Doctor deactivated successfully' };
  }

  /**
   * Get available time slots for a doctor
   */
  static async getAvailableSlots(doctorId: string, query: GetAvailableSlotsQuery) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId, isActive: true },
    });

    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    const { date, dateFrom, dateTo } = query;

    // If specific date is provided
    if (date) {
      const availableDates = (doctor.availableDates as any) || [];
      const dateSlots = availableDates.find((d: any) => d.date === date);
      
      if (!dateSlots) {
        return {
          date,
          slots: [],
        };
      }

      // Get existing appointments for this date
      const existingAppointments = await prisma.appointment.findMany({
        where: {
          doctorId,
          date: new Date(date),
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
        },
        select: {
          timeSlot: true,
        },
      });

      const bookedSlots = existingAppointments.map(apt => apt.timeSlot);

      // Filter available slots
      const availableSlots = dateSlots.timeSlots.filter((slot: any) => 
        slot.available && !bookedSlots.includes(slot.time)
      );

      return {
        date,
        slots: availableSlots,
      };
    }

    // If date range is provided
    if (dateFrom && dateTo) {
      const availableDates = (doctor.availableDates as any) || [];
      
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      
      const slotsInRange = [];

      for (const dateSlot of availableDates) {
        const slotDate = new Date(dateSlot.date);
        
        if (slotDate >= fromDate && slotDate <= toDate) {
          // Get existing appointments for this date
          const existingAppointments = await prisma.appointment.findMany({
            where: {
              doctorId,
              date: slotDate,
              status: {
                in: ['PENDING', 'CONFIRMED'],
              },
            },
            select: {
              timeSlot: true,
            },
          });

          const bookedSlots = existingAppointments.map(apt => apt.timeSlot);

          // Filter available slots
          const availableSlots = dateSlot.timeSlots.filter((slot: any) => 
            slot.available && !bookedSlots.includes(slot.time)
          );

          slotsInRange.push({
            date: dateSlot.date,
            slots: availableSlots,
          });
        }
      }

      return slotsInRange;
    }

    // Return all available dates with slots
    const availableDates = (doctor.availableDates as any) || [];
    const allSlots = [];

    for (const dateSlot of availableDates) {
      // Get existing appointments for this date
      const existingAppointments = await prisma.appointment.findMany({
        where: {
          doctorId,
          date: new Date(dateSlot.date),
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
        },
        select: {
          timeSlot: true,
        },
      });

      const bookedSlots = existingAppointments.map(apt => apt.timeSlot);

      // Filter available slots
      const availableSlots = dateSlot.timeSlots.filter((slot: any) => 
        slot.available && !bookedSlots.includes(slot.time)
      );

      allSlots.push({
        date: dateSlot.date,
        slots: availableSlots,
      });
    }

    return allSlots;
  }

  /**
   * Get doctor specialties (for filtering)
   */
  static async getSpecialties() {
    const specialties = await prisma.doctor.findMany({
      where: { isActive: true },
      select: { specialty: true },
      distinct: ['specialty'],
      orderBy: { specialty: 'asc' },
    });

    return specialties.map(s => s.specialty);
  }

  /**
   * Get hospitals (for filtering)
   */
  static async getHospitals() {
    const hospitals = await prisma.doctor.findMany({
      where: { isActive: true },
      select: { hospital: true },
      distinct: ['hospital'],
      orderBy: { hospital: 'asc' },
    });

    return hospitals.map(h => h.hospital);
  }

  /**
   * Update doctor availability
   */
  static async updateAvailability(doctorId: string, availableDates: any[]) {
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new AppError('Doctor not found', 404);
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        availableDates,
        updatedAt: new Date(),
      },
    });

    return updatedDoctor;
  }
}