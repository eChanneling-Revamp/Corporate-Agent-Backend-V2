import { Request, Response } from 'express';
export declare class DoctorController {
    /**
     * Search doctors with filters
     */
    static searchDoctors: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    /**
     * Get doctor by ID
     */
    static getDoctor: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    /**
     * Create new doctor (admin only)
     */
    static createDoctor: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    /**
     * Update doctor (admin only)
     */
    static updateDoctor: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    /**
     * Delete doctor (admin only)
     */
    static deleteDoctor: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    /**
     * Get available time slots for a doctor
     */
    static getAvailableSlots: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    /**
     * Get all specialties
     */
    static getSpecialties: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    /**
     * Get all hospitals
     */
    static getHospitals: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    /**
     * Update doctor availability (admin only)
     */
    static updateAvailability: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
}
//# sourceMappingURL=doctor.controller.d.ts.map