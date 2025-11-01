import { Router } from 'express';
import { AgentController } from './agent.controller';
import { validate } from '@/middleware/errorHandler';
import { authenticate, authorize, adminOnly, selfOrAdmin, agentOnly } from '@/middleware/auth';
import {
  getAgentSchema,
  updateAgentSchema,
  listAgentsSchema,
} from './agent.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Agent profile routes
router.get('/me', agentOnly, AgentController.getMyProfile);
router.put('/me', agentOnly, validate(updateAgentSchema.omit({ params: true })), AgentController.updateMyProfile);
router.get('/me/dashboard', agentOnly, AgentController.getDashboard);

// Admin routes for managing agents
router.get('/', adminOnly, validate(listAgentsSchema), AgentController.listAgents);
router.get('/:id', adminOnly, validate(getAgentSchema), AgentController.getAgent);
router.put('/:id', adminOnly, validate(updateAgentSchema), AgentController.updateAgent);
router.get('/:id/dashboard', adminOnly, validate(getAgentSchema), AgentController.getAgentDashboard);
router.patch('/:id/deactivate', adminOnly, validate(getAgentSchema), AgentController.deactivateAgent);
router.patch('/:id/reactivate', adminOnly, validate(getAgentSchema), AgentController.reactivateAgent);

export default router;