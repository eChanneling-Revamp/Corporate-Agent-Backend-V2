import { z } from 'zod';

// Search doctors validation schema
export const searchDoctorsSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => val ? parseInt(val, 10) : 1),
    limit: z
      .string()
      .optional()
      .transform((val) => val ? parseInt(val, 10) : 10),
    search: z.string().optional(),
    specialty: z.string().optional(),
    hospital: z.string().optional(),
    availableDate: z.string().optional(),
    minFee: z
      .string()
      .optional()
      .transform((val) => val ? parseFloat(val) : undefined),
    maxFee: z
      .string()
      .optional()
      .transform((val) => val ? parseFloat(val) : undefined),
    minRating: z
      .string()
      .optional()
      .transform((val) => val ? parseFloat(val) : undefined),
    sortBy: z
      .enum(['name', 'specialty', 'hospital', 'consultationFee', 'rating', 'createdAt'])
      .optional()
      .default('name'),
    sortOrder: z
      .enum(['asc', 'desc'])
      .optional()
      .default('asc'),
  }),
});

// Get doctor validation schema
export const getDoctorSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid doctor ID format'),
  }),
});

// Create doctor validation schema (admin only)
export const createDoctorSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name is too long'),
    specialty: z
      .string()
      .min(2, 'Specialty must be at least 2 characters')
      .max(100, 'Specialty is too long'),
    hospital: z
      .string()
      .min(2, 'Hospital name must be at least 2 characters')
      .max(200, 'Hospital name is too long'),
    phone: z
      .string()
      .regex(/^[+]?[1-9]\d{1,14}$/, 'Invalid phone number format')
      .optional(),
    email: z
      .string()
      .email('Invalid email format')
      .optional(),
    consultationFee: z
      .number()
      .min(0, 'Consultation fee cannot be negative')
      .max(1000000, 'Consultation fee is too high'),
    rating: z
      .number()
      .min(0, 'Rating cannot be negative')
      .max(5, 'Rating cannot be more than 5')
      .optional()
      .default(0),
    photoUrl: z
      .string()
      .url('Invalid photo URL format')
      .optional(),
    description: z
      .string()
      .max(1000, 'Description is too long')
      .optional(),
    availableDates: z
      .array(z.object({
        date: z.string(),
        timeSlots: z.array(z.object({
          time: z.string(),
          available: z.boolean(),
        })),
      }))
      .optional(),
  }),
});

// Update doctor validation schema (admin only)
export const updateDoctorSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid doctor ID format'),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name is too long')
      .optional(),
    specialty: z
      .string()
      .min(2, 'Specialty must be at least 2 characters')
      .max(100, 'Specialty is too long')
      .optional(),
    hospital: z
      .string()
      .min(2, 'Hospital name must be at least 2 characters')
      .max(200, 'Hospital name is too long')
      .optional(),
    phone: z
      .string()
      .regex(/^[+]?[1-9]\d{1,14}$/, 'Invalid phone number format')
      .optional(),
    email: z
      .string()
      .email('Invalid email format')
      .optional(),
    consultationFee: z
      .number()
      .min(0, 'Consultation fee cannot be negative')
      .max(1000000, 'Consultation fee is too high')
      .optional(),
    rating: z
      .number()
      .min(0, 'Rating cannot be negative')
      .max(5, 'Rating cannot be more than 5')
      .optional(),
    photoUrl: z
      .string()
      .url('Invalid photo URL format')
      .optional(),
    description: z
      .string()
      .max(1000, 'Description is too long')
      .optional(),
    availableDates: z
      .array(z.object({
        date: z.string(),
        timeSlots: z.array(z.object({
          time: z.string(),
          available: z.boolean(),
        })),
      }))
      .optional(),
    isActive: z.boolean().optional(),
  }),
});

// Get available slots validation schema
export const getAvailableSlotsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid doctor ID format'),
  }),
  query: z.object({
    date: z.string().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  }),
});

export type SearchDoctorsQuery = z.infer<typeof searchDoctorsSchema>['query'];
export type GetDoctorParams = z.infer<typeof getDoctorSchema>['params'];
export type CreateDoctorInput = z.infer<typeof createDoctorSchema>['body'];
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>['body'];
export type UpdateDoctorParams = z.infer<typeof updateDoctorSchema>['params'];
export type GetAvailableSlotsParams = z.infer<typeof getAvailableSlotsSchema>['params'];
export type GetAvailableSlotsQuery = z.infer<typeof getAvailableSlotsSchema>['query'];