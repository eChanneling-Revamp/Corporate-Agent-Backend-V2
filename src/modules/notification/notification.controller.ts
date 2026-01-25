import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notification.service';
import { successResponse, errorResponse } from '../../utils/response';

export class NotificationController {
  /**
   * Get all notifications for the authenticated agent
   */
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const agentId = req.user?.agentId;
      
      if (!agentId) {
        return errorResponse(res, 'Agent ID not found', 401);
      }

      const { isRead, page, limit } = req.query;

      const result = await notificationService.getNotifications(agentId, {
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 50,
      });

      return successResponse(res, 'Notifications retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const agentId = req.user?.agentId;
      
      if (!agentId) {
        return errorResponse(res, 'Agent ID not found', 401);
      }

      const { id } = req.params;

      const notification = await notificationService.markAsRead(id, agentId);

      return successResponse(res, 'Notification marked as read', notification);
    } catch (error) {
      if ((error as Error).message === 'Notification not found') {
        return errorResponse(res, 'Notification not found', 404);
      }
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const agentId = req.user?.agentId;
      
      if (!agentId) {
        return errorResponse(res, 'Agent ID not found', 401);
      }

      const result = await notificationService.markAllAsRead(agentId);

      return successResponse(res, 'All notifications marked as read', result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const agentId = req.user?.agentId;
      
      if (!agentId) {
        return errorResponse(res, 'Agent ID not found', 401);
      }

      const { id } = req.params;

      await notificationService.deleteNotification(id, agentId);

      return successResponse(res, 'Notification deleted successfully', null);
    } catch (error) {
      if ((error as Error).message === 'Notification not found') {
        return errorResponse(res, 'Notification not found', 404);
      }
      next(error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const agentId = req.user?.agentId;
      
      if (!agentId) {
        return errorResponse(res, 'Agent ID not found', 401);
      }

      const result = await notificationService.getUnreadCount(agentId);

      return successResponse(res, 'Unread count retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
