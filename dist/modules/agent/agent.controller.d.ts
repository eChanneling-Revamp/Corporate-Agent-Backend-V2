import { Request, Response } from 'express';
export declare class AgentController {
    /**
     * Get agent by ID
     */
    static getAgent: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    /**
     * Get current user's agent profile
     */
    static getMyProfile: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    /**
     * Update agent profile
     */
    static updateAgent: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    /**
     * Update current user's agent profile
     */
    static updateMyProfile: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    /**
     * List all agents (admin only)
     */
    static listAgents: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    /**
     * Get agent dashboard statistics
     */
    static getDashboard: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    /**
     * Get specific agent dashboard (admin only)
     */
    static getAgentDashboard: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    /**
     * Deactivate agent (admin only)
     */
    static deactivateAgent: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
    /**
     * Reactivate agent (admin only)
     */
    static reactivateAgent: (req: Request, res: Response, next: import("express").NextFunction) => Promise<any>;
}
//# sourceMappingURL=agent.controller.d.ts.map