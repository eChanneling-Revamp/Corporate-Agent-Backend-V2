"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agent_controller_1 = require("./agent.controller");
const errorHandler_1 = require("@/middleware/errorHandler");
const auth_1 = require("@/middleware/auth");
const agent_validation_1 = require("./agent.validation");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_1.authenticate);
// Agent profile routes
router.get('/me', auth_1.agentOnly, agent_controller_1.AgentController.getMyProfile);
router.put('/me', auth_1.agentOnly, (0, errorHandler_1.validate)(agent_validation_1.updateAgentSchema.omit({ params: true })), agent_controller_1.AgentController.updateMyProfile);
router.get('/me/dashboard', auth_1.agentOnly, agent_controller_1.AgentController.getDashboard);
// Admin routes for managing agents
router.get('/', auth_1.adminOnly, (0, errorHandler_1.validate)(agent_validation_1.listAgentsSchema), agent_controller_1.AgentController.listAgents);
router.get('/:id', auth_1.adminOnly, (0, errorHandler_1.validate)(agent_validation_1.getAgentSchema), agent_controller_1.AgentController.getAgent);
router.put('/:id', auth_1.adminOnly, (0, errorHandler_1.validate)(agent_validation_1.updateAgentSchema), agent_controller_1.AgentController.updateAgent);
router.get('/:id/dashboard', auth_1.adminOnly, (0, errorHandler_1.validate)(agent_validation_1.getAgentSchema), agent_controller_1.AgentController.getAgentDashboard);
router.patch('/:id/deactivate', auth_1.adminOnly, (0, errorHandler_1.validate)(agent_validation_1.getAgentSchema), agent_controller_1.AgentController.deactivateAgent);
router.patch('/:id/reactivate', auth_1.adminOnly, (0, errorHandler_1.validate)(agent_validation_1.getAgentSchema), agent_controller_1.AgentController.reactivateAgent);
exports.default = router;
//# sourceMappingURL=agent.routes.js.map