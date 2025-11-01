"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorController = void 0;
const doctor_service_1 = require("./doctor.service");
const response_1 = require("@/utils/response");
const errorHandler_1 = require("@/middleware/errorHandler");
class DoctorController {
    /**
     * Search doctors with filters
     */
    static searchDoctors = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const result = await doctor_service_1.DoctorService.searchDoctors(req.query);
        response_1.ResponseUtils.paginated(res, 'Doctors retrieved successfully', result.doctors, result.pagination);
    });
    /**
     * Get doctor by ID
     */
    static getDoctor = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const doctor = await doctor_service_1.DoctorService.getDoctorById(id);
        response_1.ResponseUtils.success(res, 'Doctor retrieved successfully', doctor);
    });
    /**
     * Create new doctor (admin only)
     */
    static createDoctor = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const doctor = await doctor_service_1.DoctorService.createDoctor(req.body);
        response_1.ResponseUtils.success(res, 'Doctor created successfully', doctor, 201);
    });
    /**
     * Update doctor (admin only)
     */
    static updateDoctor = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const updatedDoctor = await doctor_service_1.DoctorService.updateDoctor(id, req.body);
        response_1.ResponseUtils.success(res, 'Doctor updated successfully', updatedDoctor);
    });
    /**
     * Delete doctor (admin only)
     */
    static deleteDoctor = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const result = await doctor_service_1.DoctorService.deleteDoctor(id);
        response_1.ResponseUtils.success(res, result.message);
    });
    /**
     * Get available time slots for a doctor
     */
    static getAvailableSlots = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const slots = await doctor_service_1.DoctorService.getAvailableSlots(id, req.query);
        response_1.ResponseUtils.success(res, 'Available slots retrieved successfully', slots);
    });
    /**
     * Get all specialties
     */
    static getSpecialties = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const specialties = await doctor_service_1.DoctorService.getSpecialties();
        response_1.ResponseUtils.success(res, 'Specialties retrieved successfully', specialties);
    });
    /**
     * Get all hospitals
     */
    static getHospitals = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const hospitals = await doctor_service_1.DoctorService.getHospitals();
        response_1.ResponseUtils.success(res, 'Hospitals retrieved successfully', hospitals);
    });
    /**
     * Update doctor availability (admin only)
     */
    static updateAvailability = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const { availableDates } = req.body;
        const updatedDoctor = await doctor_service_1.DoctorService.updateAvailability(id, availableDates);
        response_1.ResponseUtils.success(res, 'Doctor availability updated successfully', updatedDoctor);
    });
}
exports.DoctorController = DoctorController;
//# sourceMappingURL=doctor.controller.js.map