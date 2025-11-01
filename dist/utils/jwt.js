"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtils = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';
class JwtUtils {
    /**
     * Generate access token
     */
    static generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign({ ...payload, type: 'access' }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    }
    /**
     * Generate refresh token
     */
    static generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign({ ...payload, type: 'refresh' }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
    }
    /**
     * Verify access token
     */
    static verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
    }
    /**
     * Verify refresh token
     */
    static verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, REFRESH_TOKEN_SECRET);
    }
    /**
     * Generate token pair (access + refresh)
     */
    static generateTokenPair(payload) {
        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload),
        };
    }
    /**
     * Decode token without verification (for debugging)
     */
    static decodeToken(token) {
        return jsonwebtoken_1.default.decode(token);
    }
    /**
     * Get token expiry date
     */
    static getTokenExpiry(token) {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            if (decoded && decoded.exp) {
                return new Date(decoded.exp * 1000);
            }
            return null;
        }
        catch {
            return null;
        }
    }
    /**
     * Check if token is expired
     */
    static isTokenExpired(token) {
        try {
            const expiry = this.getTokenExpiry(token);
            if (!expiry)
                return true;
            return expiry < new Date();
        }
        catch {
            return true;
        }
    }
}
exports.JwtUtils = JwtUtils;
//# sourceMappingURL=jwt.js.map