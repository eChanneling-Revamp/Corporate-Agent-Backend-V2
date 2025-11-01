"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointment_controller_1 = require("./appointment.controller");
const auth_1 = require("@/middleware/auth");
const validation_1 = require("@/middleware/validation");
const appointment_validation_1 = require("./appointment.validation");
const router = (0, express_1.Router)();
// All appointment routes require authentication
router.use(auth_1.authenticate);
/**
 * @route POST /appointments
 * @desc Create new appointment
 * @access Private
 */
router.post('/', (0, validation_1.validate)(appointment_validation_1.createAppointmentSchema), appointment_controller_1.AppointmentController.createAppointment);
/**
 * @route POST /appointments/bulk
 * @desc Bulk create appointments
 * @access Private
 */
router.post('/bulk', (0, validation_1.validate)(appointment_validation_1.bulkCreateAppointmentsSchema), appointment_controller_1.AppointmentController.bulkCreateAppointments);
/**
 * @route GET /appointments
 * @desc List appointments with filters and pagination
 * @access Private
 */
router.get('/', (0, validation_1.validate)(appointment_validation_1.listAppointmentsSchema, 'query'), appointment_controller_1.AppointmentController.listAppointments);
/**
 * @route GET /appointments/unpaid
 * @desc Get unpaid appointments for ACB confirmation
 * @access Private
 */
router.get('/unpaid', appointment_controller_1.AppointmentController.getUnpaidAppointments);
/**
 * @route GET /appointments/:id
 * @desc Get appointment by ID
 * @access Private
 */
router.get('/:id', appointment_controller_1.AppointmentController.getAppointmentById);
/**
 * @route PATCH /appointments/:id
 * @desc Update appointment
 * @access Private
 */
router.patch('/:id', (0, validation_1.validate)(appointment_validation_1.updateAppointmentSchema), appointment_controller_1.AppointmentController.updateAppointment);
/**
 * @route POST /appointments/:id/confirm
 * @desc Confirm appointment
 * @access Private
 */
router.post('/:id/confirm', appointment_controller_1.AppointmentController.confirmAppointment);
/**
 * @route POST /appointments/:id/cancel
 * @desc Cancel appointment
 * @access Private
 */
router.post('/:id/cancel', (0, validation_1.validate)(appointment_validation_1.cancelAppointmentSchema), appointment_controller_1.AppointmentController.cancelAppointment);
exports.default = router;
//# sourceMappingURL=appointment.routes.js.map