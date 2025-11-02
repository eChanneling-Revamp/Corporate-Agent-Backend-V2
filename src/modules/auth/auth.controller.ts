import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ResponseUtils } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';
import {
  LoginInput,
  RegisterInput,
  RefreshTokenInput,
  ChangePasswordInput,
} from './auth.validation';

export class AuthController {
  /**
   * Register a new user
   */
  static register = asyncHandler(async (req: Request<{}, {}, RegisterInput>, res: Response) => {
    const result = await AuthService.register(req.body);
    
    ResponseUtils.success(
      res,
      result,
      'User registered successfully',
      201
    );
  });

  /**
   * Login user
   */
  static login = asyncHandler(async (req: Request<{}, {}, LoginInput>, res: Response) => {
    const result = await AuthService.login(req.body);
    
    ResponseUtils.success(
      res,
      result,
      'Login successful'
    );
  });

  /**
   * Refresh access token
   */
  static refreshToken = asyncHandler(async (req: Request<{}, {}, RefreshTokenInput>, res: Response) => {
    const result = await AuthService.refreshToken(req.body);
    
    ResponseUtils.success(
      res,
      result,
      'Token refreshed successfully'
    );
  });

  /**
   * Logout user
   */
  static logout = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken;
    
    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }
    
    ResponseUtils.success(
      res,
      {},
      'Logged out successfully'
    );
  });

  /**
   * Change password
   */
  static changePassword = asyncHandler(async (req: Request<{}, {}, ChangePasswordInput>, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return ResponseUtils.unauthorized(res, 'User not authenticated');
    }
    
    const result = await AuthService.changePassword(userId, req.body);
    
    return ResponseUtils.success(
      res,
      {},
      result.message
    );
  });

  /**
   * Get current user profile
   */
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return ResponseUtils.unauthorized(res, 'User not authenticated');
    }
    
    const profile = await AuthService.getProfile(userId);
    
    return ResponseUtils.success(
      res,
      profile,
      'Profile retrieved successfully'
    );
  });

  /**
   * Verify token (for middleware use)
   */
  static verifyToken = asyncHandler(async (req: Request, res: Response) => {
    ResponseUtils.success(
      res,
      {
        user: req.user,
        valid: true,
      },
      'Token is valid'
    );
  });

  /**
   * Clean expired tokens (admin only)
   */
  static cleanExpiredTokens = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.cleanExpiredTokens();
    
    ResponseUtils.success(
      res,
      result,
      'Expired tokens cleaned successfully'
    );
  });
}