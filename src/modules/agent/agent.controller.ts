import { Request, Response } from 'express';
import { AgentService } from './agent.service';
import { ResponseUtils } from '@/utils/response';
import { asyncHandler } from '@/middleware/errorHandler';
import {
  GetAgentParams,
  UpdateAgentInput,
  UpdateAgentParams,
  ListAgentsQuery,
} from './agent.validation';

export class AgentController {
  /**
   * Get agent by ID
   */
  static getAgent = asyncHandler(async (req: Request<GetAgentParams>, res: Response) => {
    const { id } = req.params;
    const requestingUserId = req.user?.id;

    const agent = await AgentService.getAgentById(id, requestingUserId);

    ResponseUtils.success(
      res,
      agent,
      'Agent retrieved successfully'
    );
  });

  /**
   * Get current user's agent profile
   */
  static getMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return ResponseUtils.unauthorized(res, 'User not authenticated');
    }

    const agent = await AgentService.getAgentByUserId(userId);

    return ResponseUtils.success(
      res,
      agent,
      'Agent profile retrieved successfully'
    );
  });

  /**
   * Update agent profile
   */
  static updateAgent = asyncHandler(
    async (req: Request<UpdateAgentParams, {}, UpdateAgentInput>, res: Response) => {
      const { id } = req.params;
      const requestingUserId = req.user?.id;

      const updatedAgent = await AgentService.updateAgent(id, req.body, requestingUserId);

      ResponseUtils.success(
        res,
        updatedAgent,
        'Agent profile updated successfully'
      );
    }
  );

  /**
   * Update current user's agent profile
   */
  static updateMyProfile = asyncHandler(
    async (req: Request<{}, {}, UpdateAgentInput>, res: Response) => {
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtils.unauthorized(res, 'User not authenticated');
      }

      // Get agent by user ID first to get agent ID
      const existingAgent = await AgentService.getAgentByUserId(userId);
      
      const updatedAgent = await AgentService.updateAgent(existingAgent.id, req.body, userId);

      return ResponseUtils.success(
        res,
        updatedAgent,
        'Profile updated successfully'
      );
    }
  );

  /**
   * List all agents (admin only)
   */
  static listAgents = asyncHandler(
    async (req: Request<{}, {}, {}, ListAgentsQuery>, res: Response) => {
      const result = await AgentService.listAgents(req.query);

      ResponseUtils.paginated(
        res,
        'Agents retrieved successfully',
        result.agents,
        result.pagination
      );
    }
  );

  /**
   * Get agent dashboard statistics
   */
  static getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      return ResponseUtils.unauthorized(res, 'User not authenticated');
    }

    // Get agent by user ID
    const agent = await AgentService.getAgentByUserId(userId);
    
    const dashboard = await AgentService.getAgentDashboard(agent.id);

    return ResponseUtils.success(
      res,
      dashboard,
      'Dashboard data retrieved successfully'
    );
  });

  /**
   * Get specific agent dashboard (admin only)
   */
  static getAgentDashboard = asyncHandler(
    async (req: Request<GetAgentParams>, res: Response) => {
      const { id } = req.params;

      const dashboard = await AgentService.getAgentDashboard(id);

      ResponseUtils.success(
        res,
        dashboard,
        'Agent dashboard retrieved successfully'
      );
    }
  );

  /**
   * Deactivate agent (admin only)
   */
  static deactivateAgent = asyncHandler(
    async (req: Request<GetAgentParams>, res: Response) => {
      const { id } = req.params;

      const result = await AgentService.deactivateAgent(id);

      ResponseUtils.success(
        res,
        {},
        result.message
      );
    }
  );

  /**
   * Reactivate agent (admin only)
   */
  static reactivateAgent = asyncHandler(
    async (req: Request<GetAgentParams>, res: Response) => {
      const { id } = req.params;

      const result = await AgentService.reactivateAgent(id);

      ResponseUtils.success(
        res,
        {},
        result.message
      );
    }
  );
}