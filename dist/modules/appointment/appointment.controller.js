"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const appointment_service_1 = require("./appointment.service");
const response_1 = require("@/utils/response");
const appointment_validation_1 = require("./appointment.validation");
class AppointmentController {
    /**
     * Create new appointment
     */
    static async createAppointment(req, res) {
        try {
            const { body: data } = appointment_validation_1.createAppointmentSchema.parse({ body: req.body });
            const agentId = req.user.id;
            const appointment = await appointment_service_1.AppointmentService.createAppointment(agentId, data);
            return response_1.ResponseUtils.success(res, appointment, 'Appointment created successfully', 201);
        }
        catch (error) {
            return response_1.ResponseUtils.handleError(error, res);
        }
    }
    /**
     * Bulk create appointments
     */
    static async bulkCreateAppointments(req, res) {
        try {
            const { body: data } = appointment_validation_1.bulkCreateAppointmentsSchema.parse({ body: req.body });
            const agentId = req.user.id;
            const results = await appointment_service_1.AppointmentService.bulkCreateAppointments(agentId, data);
            return response_1.ResponseUtils.success(res, results, `Bulk appointment creation completed. ${results.created.length} created, ${results.failed.length} failed.`, results.failed.length > 0 ? 207 : 201 // 207 Multi-Status if some failed
            );
        }
        catch (error) {
            return response_1.ResponseUtils.handleError(error, res);
        }
    }
    /**
     * List appointments with filters and pagination
     */
    static async listAppointments(req, res) {
        try {
            const { query } = appointment_validation_1.listAppointmentsSchema.parse({ query: req.query });
            const agentId = req.user.id;
            const isAdmin = req.user.role === 'ADMIN';
            const result = await appointment_service_1.AppointmentService.listAppointments(agentId, query, isAdmin);
            return response_1.ResponseUtils.success(res, result, 'Appointments retrieved successfully');
        }
        catch (error) {
            return response_1.ResponseUtils.handleError(error, res);
        }
    }
    /**
     * Get appointment by ID
     */
    static async getAppointmentById(req, res) {
        try {
            const { id } = req.params;
            const agentId = req.user.role === 'ADMIN' ? undefined : req.user.id;
            const appointment = await appointment_service_1.AppointmentService.getAppointmentById(id, agentId);
            return response_1.ResponseUtils.success(res, appointment, 'Appointment retrieved successfully');
        }
        catch (error) {
            return response_1.ResponseUtils.handleError(error, res);
        }
    }
    /**
     * Update appointment
     */
    static async updateAppointment(req, res) {
        try {
            const { id } = req.params;
            const { body: data } = appointment_validation_1.updateAppointmentSchema.parse({ params: req.params, body: req.body });
            const agentId = req.user.role === 'ADMIN' ? undefined : req.user.id;
            const appointment = await appointment_service_1.AppointmentService.updateAppointment(id, data, agentId);
            return response_1.ResponseUtils.success(res, appointment, 'Appointment updated successfully');
        }
        catch (error) {
            return response_1.ResponseUtils.handleError(error, res);
        }
    }
    /**
     * Confirm appointment
     */
    static async confirmAppointment(req, res) {
        try {
            const { id } = req.params;
            const agentId = req.user.role === 'ADMIN' ? undefined : req.user.id;
            const appointment = await appointment_service_1.AppointmentService.confirmAppointment(id, agentId);
            return response_1.ResponseUtils.success(res, appointment, 'Appointment confirmed successfully');
        }
        catch (error) {
            return response_1.ResponseUtils.handleError(error, res);
        }
    }
    /**
     * Cancel appointment
     */
    static async cancelAppointment(req, res) {
        try {
            const { id } = req.params;
            const { body: data } = appointment_validation_1.cancelAppointmentSchema.parse({ params: req.params, body: req.body });
            const agentId = req.user.role === 'ADMIN' ? undefined : req.user.id;
            const appointment = await appointment_service_1.AppointmentService.cancelAppointment(id, data, agentId);
            return response_1.ResponseUtils.success(res, appointment, 'Appointment cancelled successfully');
        }
        catch (error) {
            return response_1.ResponseUtils.handleError(error, res);
        }
    }
    /**
     * Get unpaid appointments for ACB confirmation
     */
    static async getUnpaidAppointments(req, res) {
        try {
            const agentId = req.user.role === 'ADMIN' ? undefined : req.user.id;
            const appointments = await appointment_service_1.AppointmentService.getUnpaidAppointments(agentId);
            return response_1.ResponseUtils.success(res, appointments, 'Unpaid appointments retrieved successfully');
        }
        catch (error) {
            return response_1.ResponseUtils.handleError(error, res);
        }
    }
}
exports.AppointmentController = AppointmentController;
//# sourceMappingURL=appointment.controller.js.map