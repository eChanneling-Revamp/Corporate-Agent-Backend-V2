import jwt from 'jsonwebtoken';
import { JwtPayload } from '@/types';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export class JwtUtils {
  /**
   * Generate access token
   */
  static generateAccessToken(payload: Omit<JwtPayload, 'type'>): string {
    const tokenPayload = { ...payload, type: 'access' as const };
    return jwt.sign(tokenPayload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY } as any);
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: Omit<JwtPayload, 'type'>): string {
    const tokenPayload = { ...payload, type: 'refresh' as const };
    return jwt.sign(tokenPayload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY } as any);
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
  }

  /**
   * Generate token pair (access + refresh)
   */
  static generateTokenPair(payload: Omit<JwtPayload, 'type'>) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): any {
    return jwt.decode(token);
  }

  /**
   * Get token expiry date
   */
  static getTokenExpiry(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const expiry = this.getTokenExpiry(token);
      if (!expiry) return true;
      return expiry < new Date();
    } catch {
      return true;
    }
  }
}