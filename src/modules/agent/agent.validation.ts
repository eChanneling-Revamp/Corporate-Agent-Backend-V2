import { z } from 'zod';

// Get agent validation schema
export const getAgentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid agent ID format'),
  }),
});

// Update agent validation schema
export const updateAgentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid agent ID format'),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name is too long')
      .optional(),
    companyName: z
      .string()
      .min(2, 'Company name must be at least 2 characters')
      .max(200, 'Company name is too long')
      .optional(),
    phone: z
      .string()
      .regex(/^[+]?[1-9]\d{1,14}$/, 'Invalid phone number format')
      .optional(),
    address: z
      .string()
      .max(500, 'Address is too long')
      .optional(),
  }),
});

// List agents validation schema
export const listAgentsSchema = z.object({
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
    isActive: z
      .string()
      .optional()
      .transform((val) => val ? val === 'true' : undefined),
    sortBy: z
      .enum(['name', 'companyName', 'createdAt'])
      .optional()
      .default('createdAt'),
    sortOrder: z
      .enum(['asc', 'desc'])
      .optional()
      .default('desc'),
  }),
});

export type GetAgentParams = z.infer<typeof getAgentSchema>['params'];
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>['body'];
export type UpdateAgentParams = z.infer<typeof updateAgentSchema>['params'];
export type ListAgentsQuery = z.infer<typeof listAgentsSchema>['query'];