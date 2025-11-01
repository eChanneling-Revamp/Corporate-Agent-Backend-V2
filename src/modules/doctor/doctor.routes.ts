import { Router } from 'express';
import { DoctorController } from './doctor.controller';
import { validate } from '@/middleware/errorHandler';
import { authenticate, adminOnly, agentOnly } from '@/middleware/auth';
import {
  searchDoctorsSchema,
  getDoctorSchema,
  createDoctorSchema,
  updateDoctorSchema,
  getAvailableSlotsSchema,
} from './doctor.validation';

const router = Router();

// Public routes (for agent searching)
router.use(authenticate); // All routes require authentication

// Agent accessible routes
router.get('/', agentOnly, validate(searchDoctorsSchema), DoctorController.searchDoctors);
router.get('/specialties', agentOnly, DoctorController.getSpecialties);
router.get('/hospitals', agentOnly, DoctorController.getHospitals);
router.get('/:id', agentOnly, validate(getDoctorSchema), DoctorController.getDoctor);
router.get('/:id/slots', agentOnly, validate(getAvailableSlotsSchema), DoctorController.getAvailableSlots);

// Admin only routes
router.post('/', adminOnly, validate(createDoctorSchema), DoctorController.createDoctor);
router.put('/:id', adminOnly, validate(updateDoctorSchema), DoctorController.updateDoctor);
router.delete('/:id', adminOnly, validate(getDoctorSchema), DoctorController.deleteDoctor);
router.patch('/:id/availability', adminOnly, validate(getDoctorSchema), DoctorController.updateAvailability);

export default router;