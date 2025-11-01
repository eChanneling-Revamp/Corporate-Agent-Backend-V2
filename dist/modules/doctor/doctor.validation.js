"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvailableSlotsSchema = exports.updateDoctorSchema = exports.createDoctorSchema = exports.getDoctorSchema = exports.searchDoctorsSchema = void 0;
const zod_1 = require("zod");
// Search doctors validation schema
exports.searchDoctorsSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z
            .string()
            .optional()
            .transform((val) => val ? parseInt(val, 10) : 1),
        limit: zod_1.z
            .string()
            .optional()
            .transform((val) => val ? parseInt(val, 10) : 10),
        search: zod_1.z.string().optional(),
        specialty: zod_1.z.string().optional(),
        hospital: zod_1.z.string().optional(),
        availableDate: zod_1.z.string().optional(),
        minFee: zod_1.z
            .string()
            .optional()
            .transform((val) => val ? parseFloat(val) : undefined),
        maxFee: zod_1.z
            .string()
            .optional()
            .transform((val) => val ? parseFloat(val) : undefined),
        minRating: zod_1.z
            .string()
            .optional()
            .transform((val) => val ? parseFloat(val) : undefined),
        sortBy: zod_1.z
            .enum(['name', 'specialty', 'hospital', 'consultationFee', 'rating', 'createdAt'])
            .optional()
            .default('name'),
        sortOrder: zod_1.z
            .enum(['asc', 'desc'])
            .optional()
            .default('asc'),
    }),
});
// Get doctor validation schema
exports.getDoctorSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid doctor ID format'),
    }),
});
// Create doctor validation schema (admin only)
exports.createDoctorSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name is too long'),
        specialty: zod_1.z
            .string()
            .min(2, 'Specialty must be at least 2 characters')
            .max(100, 'Specialty is too long'),
        hospital: zod_1.z
            .string()
            .min(2, 'Hospital name must be at least 2 characters')
            .max(200, 'Hospital name is too long'),
        phone: zod_1.z
            .string()
            .regex(/^[+]?[1-9]\d{1,14}$/, 'Invalid phone number format')
            .optional(),
        email: zod_1.z
            .string()
            .email('Invalid email format')
            .optional(),
        consultationFee: zod_1.z
            .number()
            .min(0, 'Consultation fee cannot be negative')
            .max(1000000, 'Consultation fee is too high'),
        rating: zod_1.z
            .number()
            .min(0, 'Rating cannot be negative')
            .max(5, 'Rating cannot be more than 5')
            .optional()
            .default(0),
        photoUrl: zod_1.z
            .string()
            .url('Invalid photo URL format')
            .optional(),
        description: zod_1.z
            .string()
            .max(1000, 'Description is too long')
            .optional(),
        availableDates: zod_1.z
            .array(zod_1.z.object({
            date: zod_1.z.string(),
            timeSlots: zod_1.z.array(zod_1.z.object({
                time: zod_1.z.string(),
                available: zod_1.z.boolean(),
            })),
        }))
            .optional(),
    }),
});
// Update doctor validation schema (admin only)
exports.updateDoctorSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid doctor ID format'),
    }),
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name is too long')
            .optional(),
        specialty: zod_1.z
            .string()
            .min(2, 'Specialty must be at least 2 characters')
            .max(100, 'Specialty is too long')
            .optional(),
        hospital: zod_1.z
            .string()
            .min(2, 'Hospital name must be at least 2 characters')
            .max(200, 'Hospital name is too long')
            .optional(),
        phone: zod_1.z
            .string()
            .regex(/^[+]?[1-9]\d{1,14}$/, 'Invalid phone number format')
            .optional(),
        email: zod_1.z
            .string()
            .email('Invalid email format')
            .optional(),
        consultationFee: zod_1.z
            .number()
            .min(0, 'Consultation fee cannot be negative')
            .max(1000000, 'Consultation fee is too high')
            .optional(),
        rating: zod_1.z
            .number()
            .min(0, 'Rating cannot be negative')
            .max(5, 'Rating cannot be more than 5')
            .optional(),
        photoUrl: zod_1.z
            .string()
            .url('Invalid photo URL format')
            .optional(),
        description: zod_1.z
            .string()
            .max(1000, 'Description is too long')
            .optional(),
        availableDates: zod_1.z
            .array(zod_1.z.object({
            date: zod_1.z.string(),
            timeSlots: zod_1.z.array(zod_1.z.object({
                time: zod_1.z.string(),
                available: zod_1.z.boolean(),
            })),
        }))
            .optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
// Get available slots validation schema
exports.getAvailableSlotsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid doctor ID format'),
    }),
    query: zod_1.z.object({
        date: zod_1.z.string().optional(),
        dateFrom: zod_1.z.string().optional(),
        dateTo: zod_1.z.string().optional(),
    }),
});
//# sourceMappingURL=doctor.validation.js.map