import { PrismaClient, NotificationType } from '@prisma/client';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

export class NotificationService {
  /**
   * Get all notifications for an agent
   */
  async getNotifications(
    agentId: string,
    options: {
      isRead?: boolean;
      page?: number;
      limit?: number;
    } = {}
  ) {
    try {
      const { isRead, page = 1, limit = 50 } = options;
      const skip = (page - 1) * limit;

      const where: any = { agentId };
      if (isRead !== undefined) {
        where.isRead = isRead;
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.notification.count({ where }),
      ]);

      const unreadCount = await prisma.notification.count({
        where: { agentId, isRead: false },
      });

      return {
        notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        unreadCount,
      };
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      throw new Error('Failed to fetch notifications');
    }
  }

  /**
   * Create a new notification
   */
  async createNotification(data: {
    agentId: string;
    type: NotificationType;
    title: string;
    message: string;
    appointmentId?: string;
  }) {
    try {
      const notification = await prisma.notification.create({
        data,
      });

      logger.info(`Notification created for agent ${data.agentId}`, {
        notificationId: notification.id,
        type: data.type,
      });

      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string, agentId: string) {
    try {
      const notification = await prisma.notification.findFirst({
        where: { id, agentId },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });

      return updated;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for an agent
   */
  async markAllAsRead(agentId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          agentId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      logger.info(`Marked ${result.count} notifications as read for agent ${agentId}`);

      return {
        count: result.count,
      };
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark notifications as read');
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string, agentId: string) {
    try {
      const notification = await prisma.notification.findFirst({
        where: { id, agentId },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      await prisma.notification.delete({
        where: { id },
      });

      logger.info(`Notification ${id} deleted`);
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Get unread count for an agent
   */
  async getUnreadCount(agentId: string) {
    try {
      const count = await prisma.notification.count({
        where: {
          agentId,
          isRead: false,
        },
      });

      return { count };
    } catch (error) {
      logger.error('Error getting unread count:', error);
      throw new Error('Failed to get unread count');
    }
  }
}

export const notificationService = new NotificationService();
