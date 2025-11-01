import { JwtPayload } from '@/types';
export declare class JwtUtils {
    /**
     * Generate access token
     */
    static generateAccessToken(payload: Omit<JwtPayload, 'type'>): string;
    /**
     * Generate refresh token
     */
    static generateRefreshToken(payload: Omit<JwtPayload, 'type'>): string;
    /**
     * Verify access token
     */
    static verifyAccessToken(token: string): JwtPayload;
    /**
     * Verify refresh token
     */
    static verifyRefreshToken(token: string): JwtPayload;
    /**
     * Generate token pair (access + refresh)
     */
    static generateTokenPair(payload: Omit<JwtPayload, 'type'>): {
        accessToken: string;
        refreshToken: string;
    };
    /**
     * Decode token without verification (for debugging)
     */
    static decodeToken(token: string): any;
    /**
     * Get token expiry date
     */
    static getTokenExpiry(token: string): Date | null;
    /**
     * Check if token is expired
     */
    static isTokenExpired(token: string): boolean;
}
//# sourceMappingURL=jwt.d.ts.map