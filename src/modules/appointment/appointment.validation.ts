import { z } from 'zod';

// Create appointment validation schema
export const createAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.string().uuid('Invalid doctor ID format'),
    patientName: z
      .string()
      .min(2, 'Patient name must be at least 2 characters')
      .max(100, 'Patient name is too long'),
    patientEmail: z
      .string()
      .email('Invalid email format'),
    patientPhone: z
      .string()
      .regex(/^[+]?[1-9]\d{1,14}$/, 'Invalid phone number format'),
    date: z
      .string()
      .refine((date) => {
        const appointmentDate = new Date(date);
        return appointmentDate >= new Date();
      }, 'Appointment date must be in the future'),
    timeSlot: z
      .string()
      .min(1, 'Time slot is required'),
    amount: z
      .number()
      .min(0, 'Amount cannot be negative')
      .max(1000000, 'Amount is too high'),
    notes: z
      .string()
      .max(500, 'Notes are too long')
      .optional(),
  }),
});

// Bulk create appointments validation schema (for validation middleware)
export const bulkCreateAppointmentsSchema = z.object({
  appointments: z
    .array(
      z.object({
        doctorId: z.string().uuid('Invalid doctor ID format'),
        patientName: z
          .string()
          .min(2, 'Patient name must be at least 2 characters')
          .max(100, 'Patient name is too long'),
        patientEmail: z
          .string()
          .email('Invalid email format'),
        patientPhone: z
          .string()
          .regex(/^[+]?[1-9]\d{1,14}$/, 'Invalid phone number format'),
        date: z
          .string()
          .refine((date) => {
            const appointmentDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return appointmentDate >= today;
          }, 'Appointment date must be today or in the future'),
        timeSlot: z
          .string()
          .min(1, 'Time slot is required'),
        amount: z
          .number()
          .min(0, 'Amount cannot be negative')
          .max(1000000, 'Amount is too high'),
        notes: z
          .string()
          .max(500, 'Notes are too long')
          .optional(),
      })
    )
    .min(1, 'At least one appointment is required')
    .max(100, 'Cannot create more than 100 appointments at once'),
});

// List appointments validation schema
export const listAppointmentsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => val ? parseInt(val, 10) : 1),
    limit: z
      .string()
      .optional()
      .transform((val) => val ? parseInt(val, 10) : 10),
    status: z
      .enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'])
      .optional(),
    doctorId: z.string().uuid().optional(),
    patientName: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    sortBy: z
      .enum(['date', 'createdAt', 'patientName', 'status'])
      .optional()
      .default('date'),
    sortOrder: z
      .enum(['asc', 'desc'])
      .optional()
      .default('asc'),
  }),
});

// Get appointment validation schema
export const getAppointmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid appointment ID format'),
  }),
});

// Update appointment validation schema
export const updateAppointmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid appointment ID format'),
  }),
  body: z.object({
    patientName: z
      .string()
      .min(2, 'Patient name must be at least 2 characters')
      .max(100, 'Patient name is too long')
      .optional(),
    patientEmail: z
      .string()
      .email('Invalid email format')
      .optional(),
    patientPhone: z
      .string()
      .regex(/^[+]?[1-9]\d{1,14}$/, 'Invalid phone number format')
      .optional(),
    date: z
      .string()
      .refine((date) => {
        const appointmentDate = new Date(date);
        return appointmentDate >= new Date();
      }, 'Appointment date must be in the future')
      .optional(),
    timeSlot: z
      .string()
      .min(1, 'Time slot is required')
      .optional(),
    status: z
      .enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'])
      .optional(),
    notes: z
      .string()
      .max(500, 'Notes are too long')
      .optional(),
  }),
});

// Cancel appointment validation schema
export const cancelAppointmentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid appointment ID format'),
  }),
  body: z.object({
    reason: z
      .string()
      .min(5, 'Cancellation reason must be at least 5 characters')
      .max(500, 'Cancellation reason is too long'),
  }),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>['body'];
export type BulkCreateAppointmentsInput = z.infer<typeof bulkCreateAppointmentsSchema>;
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsSchema>['query'];
export type GetAppointmentParams = z.infer<typeof getAppointmentSchema>['params'];
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>['body'];
export type UpdateAppointmentParams = z.infer<typeof updateAppointmentSchema>['params'];
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>['body'];
export type CancelAppointmentParams = z.infer<typeof cancelAppointmentSchema>['params'];