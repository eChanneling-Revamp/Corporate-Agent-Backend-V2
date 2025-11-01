import { LoginInput, RegisterInput, RefreshTokenInput, ChangePasswordInput } from './auth.validation';
export declare class AuthService {
    /**
     * Register a new user and agent
     */
    static register(data: RegisterInput): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        agent: {
            id: string;
            name: string;
            companyName: string | null;
            email: string;
        };
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    /**
     * Login user
     */
    static login(data: LoginInput): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        agent: {
            id: string;
            name: string;
            companyName: string | null;
            email: string;
        } | null;
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    /**
     * Refresh access token
     */
    static refreshToken(data: RefreshTokenInput): Promise<{
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
        agent: {
            id: string;
            name: string;
            companyName: string | null;
            email: string;
        } | null;
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    /**
     * Logout user
     */
    static logout(refreshToken: string): Promise<{
        message: string;
    }>;
    /**
     * Change password
     */
    static changePassword(userId: string, data: ChangePasswordInput): Promise<{
        message: string;
    }>;
    /**
     * Get current user profile
     */
    static getProfile(userId: string): Promise<{
        agent: {
            userId: string;
            email: string;
            name: string;
            companyName: string | null;
            phone: string | null;
            address: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        isActive: boolean;
        createdAt: Date;
    } & {
        email: string;
        role: import(".prisma/client").$Enums.Role;
        password: string;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    /**
     * Clean expired refresh tokens (should be called periodically)
     */
    static cleanExpiredTokens(): Promise<{
        deletedCount: number;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map