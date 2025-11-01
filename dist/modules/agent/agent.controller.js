"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentController = void 0;
const agent_service_1 = require("./agent.service");
const response_1 = require("@/utils/response");
const errorHandler_1 = require("@/middleware/errorHandler");
class AgentController {
    /**
     * Get agent by ID
     */
    static getAgent = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const requestingUserId = req.user?.id;
        const agent = await agent_service_1.AgentService.getAgentById(id, requestingUserId);
        response_1.ResponseUtils.success(res, 'Agent retrieved successfully', agent);
    });
    /**
     * Get current user's agent profile
     */
    static getMyProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            return response_1.ResponseUtils.unauthorized(res, 'User not authenticated');
        }
        const agent = await agent_service_1.AgentService.getAgentByUserId(userId);
        response_1.ResponseUtils.success(res, 'Agent profile retrieved successfully', agent);
    });
    /**
     * Update agent profile
     */
    static updateAgent = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const requestingUserId = req.user?.id;
        const updatedAgent = await agent_service_1.AgentService.updateAgent(id, req.body, requestingUserId);
        response_1.ResponseUtils.success(res, 'Agent profile updated successfully', updatedAgent);
    });
    /**
     * Update current user's agent profile
     */
    static updateMyProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            return response_1.ResponseUtils.unauthorized(res, 'User not authenticated');
        }
        // Get agent by user ID first to get agent ID
        const existingAgent = await agent_service_1.AgentService.getAgentByUserId(userId);
        const updatedAgent = await agent_service_1.AgentService.updateAgent(existingAgent.id, req.body, userId);
        response_1.ResponseUtils.success(res, 'Profile updated successfully', updatedAgent);
    });
    /**
     * List all agents (admin only)
     */
    static listAgents = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const result = await agent_service_1.AgentService.listAgents(req.query);
        response_1.ResponseUtils.paginated(res, 'Agents retrieved successfully', result.agents, result.pagination);
    });
    /**
     * Get agent dashboard statistics
     */
    static getDashboard = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            return response_1.ResponseUtils.unauthorized(res, 'User not authenticated');
        }
        // Get agent by user ID
        const agent = await agent_service_1.AgentService.getAgentByUserId(userId);
        const dashboard = await agent_service_1.AgentService.getAgentDashboard(agent.id);
        response_1.ResponseUtils.success(res, 'Dashboard data retrieved successfully', dashboard);
    });
    /**
     * Get specific agent dashboard (admin only)
     */
    static getAgentDashboard = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const dashboard = await agent_service_1.AgentService.getAgentDashboard(id);
        response_1.ResponseUtils.success(res, 'Agent dashboard retrieved successfully', dashboard);
    });
    /**
     * Deactivate agent (admin only)
     */
    static deactivateAgent = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const result = await agent_service_1.AgentService.deactivateAgent(id);
        response_1.ResponseUtils.success(res, result.message);
    });
    /**
     * Reactivate agent (admin only)
     */
    static reactivateAgent = (0, errorHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const result = await agent_service_1.AgentService.reactivateAgent(id);
        response_1.ResponseUtils.success(res, result.message);
    });
}
exports.AgentController = AgentController;
//# sourceMappingURL=agent.controller.js.map