"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const prisma_1 = require("@/config/prisma");
const errorHandler_1 = require("@/middleware/errorHandler");
const response_1 = require("@/utils/response");
class AgentService {
    /**
     * Get agent by ID
     */
    static async getAgentById(agentId, requestingUserId) {
        const agent = await prisma_1.prisma.agent.findUnique({
            where: { id: agentId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isActive: true,
                        createdAt: true,
                    },
                },
                _count: {
                    select: {
                        appointments: true,
                        payments: true,
                        reports: true,
                    },
                },
            },
        });
        if (!agent) {
            throw new errorHandler_1.AppError('Agent not found', 404);
        }
        return agent;
    }
    /**
     * Get agent by user ID
     */
    static async getAgentByUserId(userId) {
        const agent = await prisma_1.prisma.agent.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isActive: true,
                        createdAt: true,
                    },
                },
                _count: {
                    select: {
                        appointments: true,
                        payments: true,
                        reports: true,
                    },
                },
            },
        });
        if (!agent) {
            throw new errorHandler_1.AppError('Agent profile not found', 404);
        }
        return agent;
    }
    /**
     * Update agent profile
     */
    static async updateAgent(agentId, data, requestingUserId) {
        // Check if agent exists
        const existingAgent = await prisma_1.prisma.agent.findUnique({
            where: { id: agentId },
            include: { user: true },
        });
        if (!existingAgent) {
            throw new errorHandler_1.AppError('Agent not found', 404);
        }
        // Update agent
        const updatedAgent = await prisma_1.prisma.agent.update({
            where: { id: agentId },
            data: {
                ...data,
                updatedAt: new Date(),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isActive: true,
                        createdAt: true,
                    },
                },
                _count: {
                    select: {
                        appointments: true,
                        payments: true,
                        reports: true,
                    },
                },
            },
        });
        return updatedAgent;
    }
    /**
     * List agents with pagination and filtering
     */
    static async listAgents(query) {
        const { page = 1, limit = 10, search, isActive, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        // Build where clause
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { companyName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        // Calculate pagination
        const skip = response_1.ResponseUtils.getPaginationSkip(page, limit);
        // Get agents with pagination
        const [agents, total] = await Promise.all([
            prisma_1.prisma.agent.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            role: true,
                            isActive: true,
                            createdAt: true,
                        },
                    },
                    _count: {
                        select: {
                            appointments: true,
                            payments: true,
                            reports: true,
                        },
                    },
                },
            }),
            prisma_1.prisma.agent.count({ where }),
        ]);
        const pagination = response_1.ResponseUtils.calculatePagination(page, limit, total);
        return {
            agents,
            pagination,
        };
    }
    /**
     * Get agent dashboard statistics
     */
    static async getAgentDashboard(agentId) {
        // Get current date ranges
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        // Get statistics
        const [totalAppointments, thisMonthAppointments, lastMonthAppointments, pendingAppointments, completedAppointments, totalRevenue, thisMonthRevenue, lastMonthRevenue,] = await Promise.all([
            // Total appointments
            prisma_1.prisma.appointment.count({
                where: { agentId },
            }),
            // This month appointments
            prisma_1.prisma.appointment.count({
                where: {
                    agentId,
                    createdAt: { gte: startOfMonth },
                },
            }),
            // Last month appointments
            prisma_1.prisma.appointment.count({
                where: {
                    agentId,
                    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
            }),
            // Pending appointments
            prisma_1.prisma.appointment.count({
                where: {
                    agentId,
                    status: 'PENDING',
                },
            }),
            // Completed appointments
            prisma_1.prisma.appointment.count({
                where: {
                    agentId,
                    status: 'COMPLETED',
                },
            }),
            // Total revenue
            prisma_1.prisma.payment.aggregate({
                where: {
                    agentId,
                    status: 'PAID',
                },
                _sum: { amount: true },
            }),
            // This month revenue
            prisma_1.prisma.payment.aggregate({
                where: {
                    agentId,
                    status: 'PAID',
                    createdAt: { gte: startOfMonth },
                },
                _sum: { amount: true },
            }),
            // Last month revenue
            prisma_1.prisma.payment.aggregate({
                where: {
                    agentId,
                    status: 'PAID',
                    createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
                _sum: { amount: true },
            }),
        ]);
        // Calculate percentage changes
        const appointmentChange = lastMonthAppointments > 0
            ? ((thisMonthAppointments - lastMonthAppointments) / lastMonthAppointments) * 100
            : 0;
        const revenueChange = (lastMonthRevenue._sum.amount || 0) > 0
            ? (((thisMonthRevenue._sum.amount || 0) - (lastMonthRevenue._sum.amount || 0)) / (lastMonthRevenue._sum.amount || 1)) * 100
            : 0;
        return {
            totalAppointments,
            pendingConfirmations: pendingAppointments,
            revenue: totalRevenue._sum.amount || 0,
            revenueChange: Math.round(revenueChange * 100) / 100,
            appointmentsChange: Math.round(appointmentChange * 100) / 100,
            completedAppointments,
            thisMonthAppointments,
            thisMonthRevenue: thisMonthRevenue._sum.amount || 0,
        };
    }
    /**
     * Deactivate agent
     */
    static async deactivateAgent(agentId) {
        const agent = await prisma_1.prisma.agent.update({
            where: { id: agentId },
            data: { isActive: false },
        });
        // Also deactivate the user
        await prisma_1.prisma.user.update({
            where: { id: agent.userId },
            data: { isActive: false },
        });
        return { message: 'Agent deactivated successfully' };
    }
    /**
     * Reactivate agent
     */
    static async reactivateAgent(agentId) {
        const agent = await prisma_1.prisma.agent.update({
            where: { id: agentId },
            data: { isActive: true },
        });
        // Also reactivate the user
        await prisma_1.prisma.user.update({
            where: { id: agent.userId },
            data: { isActive: true },
        });
        return { message: 'Agent reactivated successfully' };
    }
}
exports.AgentService = AgentService;
//# sourceMappingURL=agent.service.js.map