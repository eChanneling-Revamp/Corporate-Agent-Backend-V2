"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const prisma_1 = require("@/config/prisma");
const errorHandler_1 = require("@/middleware/errorHandler");
const response_1 = require("@/utils/response");
const websocket_1 = require("@/utils/websocket");
class AppointmentService {
    /**
     * Create a new appointment
     */
    static async createAppointment(agentId, data) {
        // Verify doctor exists and is active
        const doctor = await prisma_1.prisma.doctor.findUnique({
            where: { id: data.doctorId, isActive: true },
        });
        if (!doctor) {
            throw new errorHandler_1.AppError('Doctor not found or inactive', 404);
        }
        // Check if time slot is available
        const existingAppointment = await prisma_1.prisma.appointment.findFirst({
            where: {
                doctorId: data.doctorId,
                date: new Date(data.date),
                timeSlot: data.timeSlot,
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
        });
        if (existingAppointment) {
            throw new errorHandler_1.AppError('Time slot is not available', 409);
        }
        // Create appointment
        const appointment = await prisma_1.prisma.appointment.create({
            data: {
                agentId,
                doctorId: data.doctorId,
                patientName: data.patientName,
                patientEmail: data.patientEmail,
                patientPhone: data.patientPhone,
                date: new Date(data.date),
                timeSlot: data.timeSlot,
                amount: data.amount,
                notes: data.notes,
                status: 'PENDING',
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialty: true,
                        hospital: true,
                    },
                },
                agent: {
                    select: {
                        id: true,
                        name: true,
                        companyName: true,
                    },
                },
            },
        });
        // Broadcast real-time update
        (0, websocket_1.broadcastAppointmentCreated)({
            ...appointment,
            doctorName: appointment.doctor.name,
        });
        return appointment;
    }
    /**
     * Bulk create appointments
     */
    static async bulkCreateAppointments(agentId, data) {
        const results = {
            created: [],
            failed: [],
        };
        // Process appointments in transaction for consistency
        await prisma_1.prisma.$transaction(async (tx) => {
            for (const appointmentData of data.appointments) {
                try {
                    // Verify doctor exists and is active
                    const doctor = await tx.doctor.findUnique({
                        where: { id: appointmentData.doctorId, isActive: true },
                    });
                    if (!doctor) {
                        results.failed.push({
                            data: appointmentData,
                            error: 'Doctor not found or inactive',
                        });
                        continue;
                    }
                    // Check if time slot is available
                    const existingAppointment = await tx.appointment.findFirst({
                        where: {
                            doctorId: appointmentData.doctorId,
                            date: new Date(appointmentData.date),
                            timeSlot: appointmentData.timeSlot,
                            status: { in: ['PENDING', 'CONFIRMED'] },
                        },
                    });
                    if (existingAppointment) {
                        results.failed.push({
                            data: appointmentData,
                            error: 'Time slot is not available',
                        });
                        continue;
                    }
                    // Create appointment
                    const appointment = await tx.appointment.create({
                        data: {
                            agentId,
                            doctorId: appointmentData.doctorId,
                            patientName: appointmentData.patientName,
                            patientEmail: appointmentData.patientEmail,
                            patientPhone: appointmentData.patientPhone,
                            date: new Date(appointmentData.date),
                            timeSlot: appointmentData.timeSlot,
                            amount: appointmentData.amount,
                            notes: appointmentData.notes,
                            status: 'PENDING',
                        },
                        include: {
                            doctor: {
                                select: {
                                    id: true,
                                    name: true,
                                    specialty: true,
                                    hospital: true,
                                },
                            },
                        },
                    });
                    results.created.push(appointment);
                }
                catch (error) {
                    results.failed.push({
                        data: appointmentData,
                        error: error.message,
                    });
                }
            }
        });
        // Broadcast bulk creation event
        if (results.created.length > 0) {
            (0, websocket_1.broadcastAppointmentCreated)({
                type: 'bulk_created',
                count: results.created.length,
                agentId,
            });
        }
        return results;
    }
    /**
     * List appointments with filters and pagination
     */
    static async listAppointments(agentId, query, isAdmin = false) {
        const { page = 1, limit = 10, status, doctorId, patientName, dateFrom, dateTo, sortBy = 'date', sortOrder = 'asc', } = query;
        // Build where clause
        const where = {};
        // If not admin, filter by agent
        if (!isAdmin) {
            where.agentId = agentId;
        }
        if (status) {
            where.status = status;
        }
        if (doctorId) {
            where.doctorId = doctorId;
        }
        if (patientName) {
            where.patientName = { contains: patientName, mode: 'insensitive' };
        }
        if (dateFrom || dateTo) {
            where.date = {};
            if (dateFrom)
                where.date.gte = new Date(dateFrom);
            if (dateTo)
                where.date.lte = new Date(dateTo);
        }
        // Calculate pagination
        const skip = response_1.ResponseUtils.getPaginationSkip(page, limit);
        // Get appointments with pagination
        const [appointments, total] = await Promise.all([
            prisma_1.prisma.appointment.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder,
                },
                include: {
                    doctor: {
                        select: {
                            id: true,
                            name: true,
                            specialty: true,
                            hospital: true,
                            consultationFee: true,
                        },
                    },
                    agent: {
                        select: {
                            id: true,
                            name: true,
                            companyName: true,
                        },
                    },
                    payment: {
                        select: {
                            id: true,
                            amount: true,
                            status: true,
                            method: true,
                        },
                    },
                },
            }),
            prisma_1.prisma.appointment.count({ where }),
        ]);
        const pagination = response_1.ResponseUtils.calculatePagination(page, limit, total);
        return {
            appointments,
            pagination,
        };
    }
    /**
     * Get appointment by ID
     */
    static async getAppointmentById(appointmentId, agentId) {
        const where = { id: appointmentId };
        // If not admin, ensure appointment belongs to agent
        if (agentId) {
            where.agentId = agentId;
        }
        const appointment = await prisma_1.prisma.appointment.findUnique({
            where,
            include: {
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialty: true,
                        hospital: true,
                        phone: true,
                        email: true,
                        consultationFee: true,
                    },
                },
                agent: {
                    select: {
                        id: true,
                        name: true,
                        companyName: true,
                        email: true,
                        phone: true,
                    },
                },
                payment: true,
            },
        });
        if (!appointment) {
            throw new errorHandler_1.AppError('Appointment not found', 404);
        }
        return appointment;
    }
    /**
     * Update appointment
     */
    static async updateAppointment(appointmentId, data, agentId) {
        const where = { id: appointmentId };
        if (agentId) {
            where.agentId = agentId;
        }
        const existingAppointment = await prisma_1.prisma.appointment.findUnique({
            where,
            include: { doctor: true },
        });
        if (!existingAppointment) {
            throw new errorHandler_1.AppError('Appointment not found', 404);
        }
        // If updating date or time slot, check availability
        if (data.date || data.timeSlot) {
            const newDate = data.date ? new Date(data.date) : existingAppointment.date;
            const newTimeSlot = data.timeSlot || existingAppointment.timeSlot;
            const conflictingAppointment = await prisma_1.prisma.appointment.findFirst({
                where: {
                    doctorId: existingAppointment.doctorId,
                    date: newDate,
                    timeSlot: newTimeSlot,
                    status: { in: ['PENDING', 'CONFIRMED'] },
                    id: { not: appointmentId },
                },
            });
            if (conflictingAppointment) {
                throw new errorHandler_1.AppError('Time slot is not available', 409);
            }
        }
        const updatedAppointment = await prisma_1.prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined,
                updatedAt: new Date(),
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialty: true,
                        hospital: true,
                    },
                },
                agent: {
                    select: {
                        id: true,
                        name: true,
                        companyName: true,
                    },
                },
                payment: true,
            },
        });
        // Broadcast update
        (0, websocket_1.broadcastAppointmentUpdate)(updatedAppointment);
        return updatedAppointment;
    }
    /**
     * Confirm appointment
     */
    static async confirmAppointment(appointmentId, agentId) {
        const result = await this.updateAppointment(appointmentId, { status: 'CONFIRMED' }, agentId);
        return result;
    }
    /**
     * Cancel appointment
     */
    static async cancelAppointment(appointmentId, data, agentId) {
        const where = { id: appointmentId };
        if (agentId) {
            where.agentId = agentId;
        }
        const existingAppointment = await prisma_1.prisma.appointment.findUnique({
            where,
        });
        if (!existingAppointment) {
            throw new errorHandler_1.AppError('Appointment not found', 404);
        }
        const updatedAppointment = await prisma_1.prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                status: 'CANCELLED',
                cancelReason: data.reason,
                updatedAt: new Date(),
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialty: true,
                        hospital: true,
                    },
                },
                agent: {
                    select: {
                        id: true,
                        name: true,
                        companyName: true,
                    },
                },
                payment: true,
            },
        });
        // Broadcast update
        (0, websocket_1.broadcastAppointmentUpdate)(updatedAppointment);
        return updatedAppointment;
    }
    /**
     * Get unpaid appointments (for ACB confirmation)
     */
    static async getUnpaidAppointments(agentId) {
        const where = {
            status: { in: ['PENDING', 'CONFIRMED'] },
            payment: null,
        };
        if (agentId) {
            where.agentId = agentId;
        }
        const appointments = await prisma_1.prisma.appointment.findMany({
            where,
            include: {
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialty: true,
                        hospital: true,
                    },
                },
                agent: {
                    select: {
                        id: true,
                        name: true,
                        companyName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return appointments;
    }
}
exports.AppointmentService = AppointmentService;
//# sourceMappingURL=appointment.service.js.map