import { Request, Response } from 'express';
import { DoctorService } from './doctor.service';
import { ResponseUtils } from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';
import {
  SearchDoctorsQuery,
  GetDoctorParams,
  CreateDoctorInput,
  UpdateDoctorInput,
  UpdateDoctorParams,
  GetAvailableSlotsParams,
  GetAvailableSlotsQuery,
} from './doctor.validation';

export class DoctorController {
  /**
   * Search doctors with filters
   */
  static searchDoctors = asyncHandler(
    async (req: Request<{}, {}, {}, SearchDoctorsQuery>, res: Response) => {
      const result = await DoctorService.searchDoctors(req.query);

      ResponseUtils.paginated(
        res,
        'Doctors retrieved successfully',
        result.doctors,
        result.pagination
      );
    }
  );

  /**
   * Get doctor by ID
   */
  static getDoctor = asyncHandler(
    async (req: Request<GetDoctorParams>, res: Response) => {
      const { id } = req.params;

      const doctor = await DoctorService.getDoctorById(id);

      ResponseUtils.success(
        res,
        doctor,
        'Doctor retrieved successfully'
      );
    }
  );

  /**
   * Create new doctor (admin only)
   */
  static createDoctor = asyncHandler(
    async (req: Request<{}, {}, CreateDoctorInput>, res: Response) => {
      const doctor = await DoctorService.createDoctor(req.body);

      ResponseUtils.success(
        res,
        doctor,
        'Doctor created successfully',
        201
      );
    }
  );

  /**
   * Update doctor (admin only)
   */
  static updateDoctor = asyncHandler(
    async (req: Request<UpdateDoctorParams, {}, UpdateDoctorInput>, res: Response) => {
      const { id } = req.params;

      const updatedDoctor = await DoctorService.updateDoctor(id, req.body);

      ResponseUtils.success(
        res,
        updatedDoctor,
        'Doctor updated successfully'
      );
    }
  );

  /**
   * Delete doctor (admin only)
   */
  static deleteDoctor = asyncHandler(
    async (req: Request<GetDoctorParams>, res: Response) => {
      const { id } = req.params;

      const result = await DoctorService.deleteDoctor(id);

      ResponseUtils.success(
        res,
        {},
        result.message
      );
    }
  );

  /**
   * Get available time slots for a doctor
   */
  static getAvailableSlots = asyncHandler(
    async (req: Request<GetAvailableSlotsParams, {}, {}, GetAvailableSlotsQuery>, res: Response) => {
      const { id } = req.params;

      const slots = await DoctorService.getAvailableSlots(id, req.query);

      ResponseUtils.success(
        res,
        slots,
        'Available slots retrieved successfully'
      );
    }
  );

  /**
   * Get all specialties
   */
  static getSpecialties = asyncHandler(async (req: Request, res: Response) => {
    const specialties = await DoctorService.getSpecialties();

    ResponseUtils.success(
      res,
      specialties,
      'Specialties retrieved successfully'
    );
  });

  /**
   * Get all hospitals
   */
  static getHospitals = asyncHandler(async (req: Request, res: Response) => {
    const hospitals = await DoctorService.getHospitals();

    ResponseUtils.success(
      res,
      hospitals,
      'Hospitals retrieved successfully'
    );
  });

  /**
   * Update doctor availability (admin only)
   */
  static updateAvailability = asyncHandler(
    async (req: Request<GetDoctorParams>, res: Response) => {
      const { id } = req.params;
      const { availableDates } = req.body;

      const updatedDoctor = await DoctorService.updateAvailability(id, availableDates);

      ResponseUtils.success(
        res,
        updatedDoctor,
        'Doctor availability updated successfully'
      );
    }
  );
}