"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.refreshTokenSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
// Login validation schema
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string()
            .email('Invalid email format')
            .min(1, 'Email is required'),
        password: zod_1.z
            .string()
            .min(6, 'Password must be at least 6 characters')
            .max(128, 'Password is too long'),
    }),
});
// Register validation schema
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string()
            .email('Invalid email format')
            .min(1, 'Email is required'),
        password: zod_1.z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(128, 'Password is too long')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
        name: zod_1.z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name is too long'),
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
// Refresh token validation schema
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z
            .string()
            .min(1, 'Refresh token is required'),
    }),
});
// Change password validation schema
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z
            .string()
            .min(1, 'Current password is required'),
        newPassword: zod_1.z
            .string()
            .min(8, 'New password must be at least 8 characters')
            .max(128, 'New password is too long')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'New password must contain at least one uppercase letter, one lowercase letter, and one number'),
    }),
});
// Forgot password validation schema
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string()
            .email('Invalid email format')
            .min(1, 'Email is required'),
    }),
});
// Reset password validation schema
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z
            .string()
            .min(1, 'Reset token is required'),
        newPassword: zod_1.z
            .string()
            .min(8, 'New password must be at least 8 characters')
            .max(128, 'New password is too long')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'New password must contain at least one uppercase letter, one lowercase letter, and one number'),
    }),
});
//# sourceMappingURL=auth.validation.js.map