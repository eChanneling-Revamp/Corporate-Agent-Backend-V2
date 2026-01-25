import { Router } from 'express';
import { notificationController } from './notification.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validation';
import {
  getNotificationsSchema,
  markAsReadSchema,
} from './notification.validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for authenticated agent
 * @access  Private (Agent)
 */
router.get(
  '/',
  validate(getNotificationsSchema),
  notificationController.getNotifications.bind(notificationController)
);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private (Agent)
 */
router.get(
  '/unread-count',
  notificationController.getUnreadCount.bind(notificationController)
);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private (Agent)
 */
router.patch(
  '/:id/read',
  validate(markAsReadSchema),
  notificationController.markAsRead.bind(notificationController)
);

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private (Agent)
 */
router.patch(
  '/read-all',
  notificationController.markAllAsRead.bind(notificationController)
);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private (Agent)
 */
router.delete(
  '/:id',
  validate(markAsReadSchema),
  notificationController.deleteNotification.bind(notificationController)
);

export default router;
