"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validation_1 = require("../../middleware/validation");
const auth_1 = require("../../middleware/auth");
const auth_validation_1 = require("./auth.validation");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', (0, validation_1.validate)(auth_validation_1.registerSchema), auth_controller_1.AuthController.register);
router.post('/login', (0, validation_1.validate)(auth_validation_1.loginSchema), auth_controller_1.AuthController.login);
router.post('/refresh', (0, validation_1.validate)(auth_validation_1.refreshTokenSchema), auth_controller_1.AuthController.refreshToken);
router.post('/logout', auth_controller_1.AuthController.logout);
// Protected routes
router.use(auth_1.authenticate); // All routes below require authentication
router.get('/profile', auth_controller_1.AuthController.getProfile);
router.get('/verify', auth_controller_1.AuthController.verifyToken);
router.put('/change-password', (0, validation_1.validate)(auth_validation_1.changePasswordSchema), auth_controller_1.AuthController.changePassword);
// Admin only routes
router.delete('/clean-tokens', auth_1.adminOnly, auth_controller_1.AuthController.cleanExpiredTokens);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map