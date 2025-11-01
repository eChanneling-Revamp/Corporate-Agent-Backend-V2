import { UpdateAgentInput, ListAgentsQuery } from './agent.validation';
export declare class AgentService {
    /**
     * Get agent by ID
     */
    static getAgentById(agentId: string, requestingUserId?: string): Promise<{
        user: {
            email: string;
            role: import(".prisma/client").$Enums.Role;
            id: string;
            isActive: boolean;
            createdAt: Date;
        };
        _count: {
            appointments: number;
            payments: number;
            reports: number;
        };
    } & {
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
    }>;
    /**
     * Get agent by user ID
     */
    static getAgentByUserId(userId: string): Promise<{
        user: {
            email: string;
            role: import(".prisma/client").$Enums.Role;
            id: string;
            isActive: boolean;
            createdAt: Date;
        };
        _count: {
            appointments: number;
            payments: number;
            reports: number;
        };
    } & {
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
    }>;
    /**
     * Update agent profile
     */
    static updateAgent(agentId: string, data: UpdateAgentInput, requestingUserId?: string): Promise<{
        user: {
            email: string;
            role: import(".prisma/client").$Enums.Role;
            id: string;
            isActive: boolean;
            createdAt: Date;
        };
        _count: {
            appointments: number;
            payments: number;
            reports: number;
        };
    } & {
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
    }>;
    /**
     * List agents with pagination and filtering
     */
    static listAgents(query: ListAgentsQuery): Promise<{
        agents: ({
            user: {
                email: string;
                role: import(".prisma/client").$Enums.Role;
                id: string;
                isActive: boolean;
                createdAt: Date;
            };
            _count: {
                appointments: number;
                payments: number;
                reports: number;
            };
        } & {
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
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    /**
     * Get agent dashboard statistics
     */
    static getAgentDashboard(agentId: string): Promise<{
        totalAppointments: number;
        pendingConfirmations: number;
        revenue: number;
        revenueChange: number;
        appointmentsChange: number;
        completedAppointments: number;
        thisMonthAppointments: number;
        thisMonthRevenue: number;
    }>;
    /**
     * Deactivate agent
     */
    static deactivateAgent(agentId: string): Promise<{
        message: string;
    }>;
    /**
     * Reactivate agent
     */
    static reactivateAgent(agentId: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=agent.service.d.ts.map