import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { NotificationData } from '@/types';
export declare const initWebSocket: (server: HttpServer) => SocketIOServer;
/**
 * Emit event to all connected clients
 */
export declare const emitToAll: (event: string, data: any) => void;
/**
 * Emit event to specific user
 */
export declare const emitToUser: (userId: string, event: string, data: any) => void;
/**
 * Emit event to specific agent
 */
export declare const emitToAgent: (agentId: string, event: string, data: any) => void;
/**
 * Emit event to specific room
 */
export declare const emitToRoom: (room: string, event: string, data: any) => void;
/**
 * Send notification to user
 */
export declare const sendNotification: (userId: string, notification: NotificationData) => void;
/**
 * Broadcast appointment update
 */
export declare const broadcastAppointmentUpdate: (appointmentData: any) => void;
/**
 * Broadcast new appointment creation
 */
export declare const broadcastAppointmentCreated: (appointmentData: any) => void;
/**
 * Broadcast payment update
 */
export declare const broadcastPaymentUpdate: (paymentData: any) => void;
/**
 * Get WebSocket server instance
 */
export declare const getWebSocketServer: () => SocketIOServer | undefined;
/**
 * Get connected clients count
 */
export declare const getConnectedClientsCount: () => number;
/**
 * Get connected clients in a room
 */
export declare const getRoomClientsCount: (room: string) => number;
//# sourceMappingURL=websocket.d.ts.map