"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelAppointmentSchema = exports.updateAppointmentSchema = exports.getAppointmentSchema = exports.listAppointmentsSchema = exports.bulkCreateAppointmentsSchema = exports.createAppointmentSchema = void 0;
const zod_1 = require("zod");
// Create appointment validation schema
exports.createAppointmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        doctorId: zod_1.z.string().uuid('Invalid doctor ID format'),
        patientName: zod_1.z
            .string()
            .min(2, 'Patient name must be at least 2 characters')
            .max(100, 'Patient name is too long'),
        patientEmail: zod_1.z
            .string()
            .email('Invalid email format'),
        patientPhone: zod_1.z
            .string()
            .regex(/^[+]?[1-9]\d{1,14}$/, 'Invalid phone number format'),
        date: zod_1.z
            .string()
            .refine((date) => {
            const appointmentDate = new Date(date);
            return appointmentDate >= new Date();
        }, 'Appointment date must be in the future'),
        timeSlot: zod_1.z
            .string()
            .min(1, 'Time slot is required'),
        amount: zod_1.z
            .number()
            .min(0, 'Amount cannot be negative')
            .max(1000000, 'Amount is too high'),
        notes: zod_1.z
            .string()
            .max(500, 'Notes are too long')
            .optional(),
    }),
});
// Bulk create appointments validation schema
exports.bulkCreateAppointmentsSchema = zod_1.z.object({
    body: zod_1.z.object({
        appointments: zod_1.z
            .array(zod_1.z.object({
            doctorId: zod_1.z.string().uuid('Invalid doctor ID format'),
            patientName: zod_1.z
                .string()
                .min(2, 'Patient name must be at least 2 characters')
                .max(100, 'Patient name is too long'),
            patientEmail: zod_1.z
                .string()
                .email('Invalid email format'),
            patientPhone: zod_1.z
                .string()
                .regex(/^[+]?[1-9]\d{1,14}$/, 'Invalid phone number format'),
            date: zod_1.z
                .string()
                .refine((date) => {
                const appointmentDate = new Date(date);
                return appointmentDate >= new Date();
            }, 'Appointment date must be in the future'),
            timeSlot: zod_1.z
                .string()
                .min(1, 'Time slot is required'),
            amount: zod_1.z
                .number()
                .min(0, 'Amount cannot be negative')
                .max(1000000, 'Amount is too high'),
            notes: zod_1.z
                .string()
                .max(500, 'Notes are too long')
                .optional(),
        }))
            .min(1, 'At least one appointment is required')
            .max(100, 'Cannot create more than 100 appointments at once'),
    }),
});
// List appointments validation schema
exports.listAppointmentsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z
            .string()
            .optional()
            .transform((val) => val ? parseInt(val, 10) : 1),
        limit: zod_1.z
            .string()
            .optional()
            .transform((val) => val ? parseInt(val, 10) : 10),
        status: zod_1.z
            .enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'])
            .optional(),
        doctorId: zod_1.z.string().uuid().optional(),
        patientName: zod_1.z.string().optional(),
        dateFrom: zod_1.z.string().optional(),
        dateTo: zod_1.z.string().optional(),
        sortBy: zod_1.z
            .enum(['date', 'createdAt', 'patientName', 'status'])
            .optional()
            .default('date'),
        sortOrder: zod_1.z
            .enum(['asc', 'desc'])
            .optional()
            .default('asc'),
    }),
});
// Get appointment validation schema
exports.getAppointmentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid appointment ID format'),
    }),
});
// Update appointment validation schema
exports.updateAppointmentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid appointment ID format'),
    }),
    body: zod_1.z.object({
        patientName: zod_1.z
            .string()
            .min(2, 'Patient name must be at least 2 characters')
            .max(100, 'Patient name is too long')
            .optional(),
        patientEmail: zod_1.z
            .string()
            .email('Invalid email format')
            .optional(),
        patientPhone: zod_1.z
            .string()
            .regex(/^[+]?[1-9]\d{1,14}$/, 'Invalid phone number format')
            .optional(),
        date: zod_1.z
            .string()
            .refine((date) => {
            const appointmentDate = new Date(date);
            return appointmentDate >= new Date();
        }, 'Appointment date must be in the future')
            .optional(),
        timeSlot: zod_1.z
            .string()
            .min(1, 'Time slot is required')
            .optional(),
        status: zod_1.z
            .enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'])
            .optional(),
        notes: zod_1.z
            .string()
            .max(500, 'Notes are too long')
            .optional(),
    }),
});
// Cancel appointment validation schema
exports.cancelAppointmentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid appointment ID format'),
    }),
    body: zod_1.z.object({
        reason: zod_1.z
            .string()
            .min(5, 'Cancellation reason must be at least 5 characters')
            .max(500, 'Cancellation reason is too long'),
    }),
});
//# sourceMappingURL=appointment.validation.js.map