import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notification.service';
import { ResponseUtils } from '../../utils/response';

export class NotificationController {
  /**
   * Get all notifications for the authenticated agent
   */
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const agentId = req.user?.agent?.id;
      
      if (!agentId) {
        return ResponseUtils.error(res, 'Agent ID not found', 401);
      }

      const { isRead, page, limit } = req.query;

      const result = await notificationService.getNotifications(agentId, {
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 50,
      });

      return ResponseUtils.success(res, result, 'Notifications retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const agentId = req.user?.agent?.id;
      
      if (!agentId) {
        return ResponseUtils.error(res, 'Agent ID not found', 401);
      }

      const { id } = req.params;

      const notification = await notificationService.markAsRead(id, agentId);

      return ResponseUtils.success(res, notification, 'Notification marked as read');
    } catch (error) {
      if ((error as Error).message === 'Notification not found') {
        return ResponseUtils.error(res, 'Notification not found', 404);
      }
      next(error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const agentId = req.user?.agent?.id;
      
      if (!agentId) {
        return ResponseUtils.error(res, 'Agent ID not found', 401);
      }

      const result = await notificationService.markAllAsRead(agentId);

      return ResponseUtils.success(res, result, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const agentId = req.user?.agent?.id;
      
      if (!agentId) {
        return ResponseUtils.error(res, 'Agent ID not found', 401);
      }

      const { id } = req.params;

      await notificationService.deleteNotification(id, agentId);

      return ResponseUtils.success(res, null, 'Notification deleted successfully');
    } catch (error) {
      if ((error as Error).message === 'Notification not found') {
        return ResponseUtils.error(res, 'Notification not found', 404);
      }
      next(error);
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const agentId = req.user?.agent?.id;
      
      if (!agentId) {
        return ResponseUtils.error(res, 'Agent ID not found', 401);
      }

      const result = await notificationService.getUnreadCount(agentId);

      return ResponseUtils.success(res, result, 'Unread count retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
