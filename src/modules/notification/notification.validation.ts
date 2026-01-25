import { z } from 'zod';

export const getNotificationsSchema = z.object({
  query: z.object({
    isRead: z.enum(['true', 'false']).optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export const markAsReadSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const markAllAsReadSchema = z.object({
  body: z.object({
    agentId: z.string().uuid().optional(),
  }),
});

export type GetNotificationsInput = z.infer<typeof getNotificationsSchema>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
export type MarkAllAsReadInput = z.infer<typeof markAllAsReadSchema>;
