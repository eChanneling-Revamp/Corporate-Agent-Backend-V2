import { Request, Response } from 'express';
export declare class AppointmentController {
    /**
     * Create new appointment
     */
    static createAppointment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Bulk create appointments
     */
    static bulkCreateAppointments(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * List appointments with filters and pagination
     */
    static listAppointments(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get appointment by ID
     */
    static getAppointmentById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Update appointment
     */
    static updateAppointment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Confirm appointment
     */
    static confirmAppointment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Cancel appointment
     */
    static cancelAppointment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Get unpaid appointments for ACB confirmation
     */
    static getUnpaidAppointments(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=appointment.controller.d.ts.map