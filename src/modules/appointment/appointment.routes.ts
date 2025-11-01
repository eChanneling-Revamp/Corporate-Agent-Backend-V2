import { Router } from 'express';
import { AppointmentController } from './appointment.controller';
import { authenticate } from '@/middleware/auth';
import { validate } from '@/middleware/validation';
import {
  createAppointmentSchema,
  bulkCreateAppointmentsSchema,
  listAppointmentsSchema,
  updateAppointmentSchema,
  cancelAppointmentSchema,
} from './appointment.validation';

const router = Router();

// All appointment routes require authentication
router.use(authenticate);

/**
 * @route POST /appointments
 * @desc Create new appointment
 * @access Private
 */
router.post(
  '/',
  validate(createAppointmentSchema),
  AppointmentController.createAppointment
);

/**
 * @route POST /appointments/bulk
 * @desc Bulk create appointments
 * @access Private
 */
router.post(
  '/bulk',
  validate(bulkCreateAppointmentsSchema),
  AppointmentController.bulkCreateAppointments
);

/**
 * @route GET /appointments
 * @desc List appointments with filters and pagination
 * @access Private
 */
router.get(
  '/',
  validate(listAppointmentsSchema, 'query'),
  AppointmentController.listAppointments
);

/**
 * @route GET /appointments/unpaid
 * @desc Get unpaid appointments for ACB confirmation
 * @access Private
 */
router.get('/unpaid', AppointmentController.getUnpaidAppointments);

/**
 * @route GET /appointments/:id
 * @desc Get appointment by ID
 * @access Private
 */
router.get('/:id', AppointmentController.getAppointmentById);

/**
 * @route PATCH /appointments/:id
 * @desc Update appointment
 * @access Private
 */
router.patch(
  '/:id',
  validate(updateAppointmentSchema),
  AppointmentController.updateAppointment
);

/**
 * @route POST /appointments/:id/confirm
 * @desc Confirm appointment
 * @access Private
 */
router.post('/:id/confirm', AppointmentController.confirmAppointment);

/**
 * @route POST /appointments/:id/cancel
 * @desc Cancel appointment
 * @access Private
 */
router.post(
  '/:id/cancel',
  validate(cancelAppointmentSchema),
  AppointmentController.cancelAppointment
);

export default router;