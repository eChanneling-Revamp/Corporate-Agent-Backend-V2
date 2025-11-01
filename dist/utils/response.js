"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseUtils = void 0;
class ResponseUtils {
    /**
     * Send success response
     */
    static success(res, data, message, statusCode = 200) {
        const response = {
            success: true,
            message,
            data,
        };
        return res.status(statusCode).json(response);
    }
    /**
     * Send error response
     */
    static error(res, message, statusCode = 500, error) {
        const response = {
            success: false,
            message,
            error,
        };
        return res.status(statusCode).json(response);
    }
    /**
     * Send validation error response
     */
    static validationError(res, message, errors, statusCode = 400) {
        const response = {
            success: false,
            message,
            errors,
        };
        return res.status(statusCode).json(response);
    }
    /**
     * Send paginated response
     */
    static paginated(res, message, data, pagination, statusCode = 200) {
        const response = {
            success: true,
            message,
            data,
            pagination,
        };
        return res.status(statusCode).json(response);
    }
    /**
     * Send not found response
     */
    static notFound(res, message = 'Resource not found') {
        return this.error(res, message, 404);
    }
    /**
     * Send unauthorized response
     */
    static unauthorized(res, message = 'Unauthorized access') {
        return this.error(res, message, 401);
    }
    /**
     * Send forbidden response
     */
    static forbidden(res, message = 'Forbidden access') {
        return this.error(res, message, 403);
    }
    /**
     * Send bad request response
     */
    static badRequest(res, message = 'Bad request') {
        return this.error(res, message, 400);
    }
    /**
     * Send internal server error response
     */
    static internalError(res, message = 'Internal server error') {
        return this.error(res, message, 500);
    }
    /**
     * Send conflict response
     */
    static conflict(res, message = 'Resource conflict') {
        return this.error(res, message, 409);
    }
    /**
     * Send no content response
     */
    static noContent(res) {
        return res.status(204).send();
    }
    /**
     * Calculate pagination metadata
     */
    static calculatePagination(page = 1, limit = 10, total) {
        const pages = Math.ceil(total / limit);
        return {
            page: Math.max(1, page),
            limit: Math.max(1, limit),
            total,
            pages: Math.max(1, pages),
        };
    }
    /**
     * Get pagination skip value for database queries
     */
    static getPaginationSkip(page = 1, limit = 10) {
        return Math.max(0, (page - 1) * limit);
    }
    /**
     * Handle and format error responses
     */
    static handleError(error, res) {
        console.error('Error occurred:', error);
        if (error.name === 'ZodError') {
            const errorMessage = error.errors
                .map((err) => `${err.path.join('.')}: ${err.message}`)
                .join(', ');
            return this.badRequest(res, `Validation error: ${errorMessage}`);
        }
        if (error.name === 'PrismaClientKnownRequestError') {
            switch (error.code) {
                case 'P2002':
                    return this.conflict(res, 'A record with this data already exists');
                case 'P2025':
                    return this.notFound(res, 'Record not found');
                default:
                    return this.internalError(res, 'Database operation failed');
            }
        }
        if (error.message) {
            const statusCode = error.statusCode || 500;
            return this.error(res, error.message, statusCode);
        }
        return this.internalError(res, 'An unexpected error occurred');
    }
}
exports.ResponseUtils = ResponseUtils;
//# sourceMappingURL=response.js.map