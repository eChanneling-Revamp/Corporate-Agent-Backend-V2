import { Response } from 'express';
export declare class ResponseUtils {
    /**
     * Send success response
     */
    static success<T>(res: Response, data: T, message: string, statusCode?: number): Response;
    /**
     * Send error response
     */
    static error(res: Response, message: string, statusCode?: number, error?: string): Response;
    /**
     * Send validation error response
     */
    static validationError(res: Response, message: string, errors: Record<string, string[]>, statusCode?: number): Response;
    /**
     * Send paginated response
     */
    static paginated<T>(res: Response, message: string, data: T[], pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    }, statusCode?: number): Response;
    /**
     * Send not found response
     */
    static notFound(res: Response, message?: string): Response;
    /**
     * Send unauthorized response
     */
    static unauthorized(res: Response, message?: string): Response;
    /**
     * Send forbidden response
     */
    static forbidden(res: Response, message?: string): Response;
    /**
     * Send bad request response
     */
    static badRequest(res: Response, message?: string): Response;
    /**
     * Send internal server error response
     */
    static internalError(res: Response, message?: string): Response;
    /**
     * Send conflict response
     */
    static conflict(res: Response, message?: string): Response;
    /**
     * Send no content response
     */
    static noContent(res: Response): Response;
    /**
     * Calculate pagination metadata
     */
    static calculatePagination(page: number | undefined, limit: number | undefined, total: number): {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    /**
     * Get pagination skip value for database queries
     */
    static getPaginationSkip(page?: number, limit?: number): number;
    /**
     * Handle and format error responses
     */
    static handleError(error: any, res: Response): Response;
}
//# sourceMappingURL=response.d.ts.map