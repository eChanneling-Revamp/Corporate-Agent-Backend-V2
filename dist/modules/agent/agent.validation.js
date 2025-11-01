"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAgentsSchema = exports.updateAgentSchema = exports.getAgentSchema = void 0;
const zod_1 = require("zod");
// Get agent validation schema
exports.getAgentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid agent ID format'),
    }),
});
// Update agent validation schema
exports.updateAgentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid agent ID format'),
    }),
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name is too long')
            .optional(),
        companyName: zod_1.z
            .string()
            .min(2, 'Company name must be at least 2 characters')
            .max(200, 'Company name is too long')
            .optional(),
        phone: zod_1.z
            .string()
            .regex(/^[+]?[1-9]\d{1,14}$/, 'Invalid phone number format')
            .optional(),
        address: zod_1.z
            .string()
            .max(500, 'Address is too long')
            .optional(),
    }),
});
// List agents validation schema
exports.listAgentsSchema = zod_1.z.object({
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
        isActive: zod_1.z
            .string()
            .optional()
            .transform((val) => val ? val === 'true' : undefined),
        sortBy: zod_1.z
            .enum(['name', 'companyName', 'createdAt'])
            .optional()
            .default('createdAt'),
        sortOrder: zod_1.z
            .enum(['asc', 'desc'])
            .optional()
            .default('desc'),
    }),
});
//# sourceMappingURL=agent.validation.js.map