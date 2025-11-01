"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const response_1 = require("../../utils/response");
class AuthController {
    /**
     * Register a new user
     */
    static register = asyncHandler(async (req, res) => {
        const result = await auth_service_1.AuthService.register(req.body);
        response_1.ResponseUtils.success(res, 'User registered successfully', result, 201);
    });
    /**
     * Login user
     */
    static login = asyncHandler(async (req, res) => {
        const result = await auth_service_1.AuthService.login(req.body);
        response_1.ResponseUtils.success(res, 'Login successful', result);
    });
    /**
     * Refresh access token
     */
    static refreshToken = asyncHandler(async (req, res) => {
        const result = await auth_service_1.AuthService.refreshToken(req.body);
        response_1.ResponseUtils.success(res, 'Token refreshed successfully', result);
    });
    /**
     * Logout user
     */
    static logout = asyncHandler(async (req, res) => {
        const refreshToken = req.body.refreshToken;
        if (refreshToken) {
            await auth_service_1.AuthService.logout(refreshToken);
        }
        response_1.ResponseUtils.success(res, 'Logged out successfully');
    });
    /**
     * Change password
     */
    static changePassword = asyncHandler(async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            return response_1.ResponseUtils.unauthorized(res, 'User not authenticated');
        }
        const result = await auth_service_1.AuthService.changePassword(userId, req.body);
        response_1.ResponseUtils.success(res, result.message);
    });
    /**
     * Get current user profile
     */
    static getProfile = asyncHandler(async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            return response_1.ResponseUtils.unauthorized(res, 'User not authenticated');
        }
        const profile = await auth_service_1.AuthService.getProfile(userId);
        response_1.ResponseUtils.success(res, 'Profile retrieved successfully', profile);
    });
    /**
     * Verify token (for middleware use)
     */
    static verifyToken = asyncHandler(async (req, res) => {
        response_1.ResponseUtils.success(res, 'Token is valid', {
            user: req.user,
            valid: true,
        });
    });
    /**
     * Clean expired tokens (admin only)
     */
    static cleanExpiredTokens = asyncHandler(async (req, res) => {
        const result = await auth_service_1.AuthService.cleanExpiredTokens();
        response_1.ResponseUtils.success(res, 'Expired tokens cleaned successfully', result);
    });
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map