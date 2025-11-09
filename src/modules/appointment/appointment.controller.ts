import { Request, Response } from 'express';
import { AppointmentService } from './appointment.service';
import { ResponseUtils } from '@/utils/response';
import {
  createAppointmentSchema,
  bulkCreateAppointmentsSchema,
  listAppointmentsSchema,
  updateAppointmentSchema,
  cancelAppointmentSchema,
} from './appointment.validation';

export class AppointmentController {
  /**
   * Create new appointment
   */
  static async createAppointment(req: Request, res: Response) {
    try {
      const { body: data } = createAppointmentSchema.parse({ body: req.body });
      const agentId = req.user!.id;

      const appointment = await AppointmentService.createAppointment(agentId, data);

      return ResponseUtils.success(res, appointment, 'Appointment created successfully', 201);
    } catch (error) {
      return ResponseUtils.handleError(error, res);
    }
  }

  /**
   * Bulk create appointments
   */
  static async bulkCreateAppointments(req: Request, res: Response) {
    try {
      // Data is already validated by middleware
      const data = req.body;
      const agentId = req.user!.id;

      const results = await AppointmentService.bulkCreateAppointments(agentId, data);

      return ResponseUtils.success(
        res,
        results,
        `Bulk appointment creation completed. ${results.created.length} created, ${results.failed.length} failed.`,
        results.failed.length > 0 ? 207 : 201 // 207 Multi-Status if some failed
      );
    } catch (error) {
      return ResponseUtils.handleError(error, res);
    }
  }

  /**
   * List appointments with filters and pagination
   */
  static async listAppointments(req: Request, res: Response) {
    try {
      const { query } = listAppointmentsSchema.parse({ query: req.query });
      const agentId = req.user!.id;
      const isAdmin = req.user!.role === 'ADMIN';

      const result = await AppointmentService.listAppointments(agentId, query, isAdmin);

      return ResponseUtils.success(res, result, 'Appointments retrieved successfully');
    } catch (error) {
      return ResponseUtils.handleError(error, res);
    }
  }

  /**
   * Get appointment by ID
   */
  static async getAppointmentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const agentId: string | undefined = req.user!.role === 'ADMIN' ? undefined : req.user!.id;

      const appointment = await (AppointmentService.getAppointmentById as any)(id, agentId);

      return ResponseUtils.success(res, appointment, 'Appointment retrieved successfully');
    } catch (error) {
      return ResponseUtils.handleError(error, res);
    }
  }

  /**
   * Update appointment
   */
  static async updateAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { body: data } = updateAppointmentSchema.parse({ params: req.params, body: req.body });
      const agentId: string | undefined = req.user!.role === 'ADMIN' ? undefined : req.user!.id;

      const appointment = await (AppointmentService.updateAppointment as any)(id, data, agentId);

      return ResponseUtils.success(res, appointment, 'Appointment updated successfully');
    } catch (error) {
      return ResponseUtils.handleError(error, res);
    }
  }

  /**
   * Confirm appointment
   */
  static async confirmAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const agentId: string | undefined = req.user!.role === 'ADMIN' ? undefined : req.user!.id;

      const appointment = await (AppointmentService.confirmAppointment as any)(id, agentId);

      return ResponseUtils.success(res, appointment, 'Appointment confirmed successfully');
    } catch (error) {
      return ResponseUtils.handleError(error, res);
    }
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { body: data } = cancelAppointmentSchema.parse({ params: req.params, body: req.body });
      const agentId: string | undefined = req.user!.role === 'ADMIN' ? undefined : req.user!.id;

      const appointment = await (AppointmentService.cancelAppointment as any)(id, data, agentId);

      return ResponseUtils.success(res, appointment, 'Appointment cancelled successfully');
    } catch (error) {
      return ResponseUtils.handleError(error, res);
    }
  }

  /**
   * Get unpaid appointments for ACB confirmation
   */
  static async getUnpaidAppointments(req: Request, res: Response) {
    try {
      const agentId = req.user!.role === 'ADMIN' ? undefined : req.user!.id;

      const appointments = await AppointmentService.getUnpaidAppointments(agentId);

      return ResponseUtils.success(
        res,
        appointments,
        'Unpaid appointments retrieved successfully'
      );
    } catch (error) {
      return ResponseUtils.handleError(error, res);
    }
  }
}