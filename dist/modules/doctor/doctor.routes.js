"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const doctor_controller_1 = require("./doctor.controller");
const errorHandler_1 = require("@/middleware/errorHandler");
const auth_1 = require("@/middleware/auth");
const doctor_validation_1 = require("./doctor.validation");
const router = (0, express_1.Router)();
// Public routes (for agent searching)
router.use(auth_1.authenticate); // All routes require authentication
// Agent accessible routes
router.get('/', auth_1.agentOnly, (0, errorHandler_1.validate)(doctor_validation_1.searchDoctorsSchema), doctor_controller_1.DoctorController.searchDoctors);
router.get('/specialties', auth_1.agentOnly, doctor_controller_1.DoctorController.getSpecialties);
router.get('/hospitals', auth_1.agentOnly, doctor_controller_1.DoctorController.getHospitals);
router.get('/:id', auth_1.agentOnly, (0, errorHandler_1.validate)(doctor_validation_1.getDoctorSchema), doctor_controller_1.DoctorController.getDoctor);
router.get('/:id/slots', auth_1.agentOnly, (0, errorHandler_1.validate)(doctor_validation_1.getAvailableSlotsSchema), doctor_controller_1.DoctorController.getAvailableSlots);
// Admin only routes
router.post('/', auth_1.adminOnly, (0, errorHandler_1.validate)(doctor_validation_1.createDoctorSchema), doctor_controller_1.DoctorController.createDoctor);
router.put('/:id', auth_1.adminOnly, (0, errorHandler_1.validate)(doctor_validation_1.updateDoctorSchema), doctor_controller_1.DoctorController.updateDoctor);
router.delete('/:id', auth_1.adminOnly, (0, errorHandler_1.validate)(doctor_validation_1.getDoctorSchema), doctor_controller_1.DoctorController.deleteDoctor);
router.patch('/:id/availability', auth_1.adminOnly, (0, errorHandler_1.validate)(doctor_validation_1.getDoctorSchema), doctor_controller_1.DoctorController.updateAvailability);
exports.default = router;
//# sourceMappingURL=doctor.routes.js.map