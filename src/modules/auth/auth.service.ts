import bcrypt from 'bcryptjs';
import { prisma } from '@/config/prisma';
import { JwtUtils } from '@/utils/jwt';
import { AppError } from '@/middleware/errorHandler';
import {
  LoginInput,
  RegisterInput,
  RefreshTokenInput,
  ChangePasswordInput,
} from './auth.validation';

export class AuthService {
  /**
   * Register a new user and agent
   */
  static async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    // Create user and agent in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: 'AGENT',
        },
      });

      // Create agent profile
      const agent = await tx.agent.create({
        data: {
          name: data.name,
          email: data.email,
          companyName: data.companyName,
          phone: data.phone,
          address: data.address,
          userId: user.id,
        },
      });

      return { user, agent };
    });

    // Generate tokens
    const tokens = JwtUtils.generateTokenPair({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: result.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
      agent: {
        id: result.agent.id,
        name: result.agent.name,
        companyName: result.agent.companyName,
        email: result.agent.email,
      },
      tokens,
    };
  }

  /**
   * Login user
   */
  static async login(data: LoginInput) {
    // Find user with agent data
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        agent: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const tokens = JwtUtils.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      agent: user.agent ? {
        id: user.agent.id,
        name: user.agent.name,
        companyName: user.agent.companyName,
        email: user.agent.email,
      } : null,
      tokens,
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(data: RefreshTokenInput) {
    // Verify refresh token
    let decoded;
    try {
      decoded = JwtUtils.verifyRefreshToken(data.refreshToken);
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: data.refreshToken },
    });

    if (!storedToken) {
      throw new AppError('Refresh token not found', 401);
    }

    if (storedToken.expiresAt < new Date()) {
      // Remove expired token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new AppError('Refresh token expired', 401);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { agent: true },
    });

    if (!user || !user.isActive) {
      throw new AppError('User not found or deactivated', 401);
    }

    // Generate new tokens
    const tokens = JwtUtils.generateTokenPair({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Replace old refresh token with new one
    await prisma.$transaction([
      prisma.refreshToken.delete({
        where: { id: storedToken.id },
      }),
      prisma.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      }),
    ]);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      agent: user.agent ? {
        id: user.agent.id,
        name: user.agent.name,
        companyName: user.agent.companyName,
        email: user.agent.email,
      } : null,
      tokens,
    };
  }

  /**
   * Logout user
   */
  static async logout(refreshToken: string) {
    // Remove refresh token from database
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    return { message: 'Logged out successfully' };
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, data: ChangePasswordInput) {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(data.currentPassword, user.password);
    if (!isValidPassword) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(data.newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Invalidate all existing refresh tokens for security
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Get current user profile
   */
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        agent: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        agent: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Clean expired refresh tokens (should be called periodically)
   */
  static async cleanExpiredTokens() {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return { deletedCount: result.count };
  }
}