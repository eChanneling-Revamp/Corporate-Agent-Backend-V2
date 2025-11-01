import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { JwtUtils } from './jwt';
import { WebSocketEvent, NotificationData } from '@/types';

let io: SocketIOServer;

export const initWebSocket = (server: HttpServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = JwtUtils.verifyAccessToken(token);
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`User connected: ${user.email} (${socket.id})`);

    // Join user to their personal room
    socket.join(`user:${user.userId}`);
    
    // Join agent to their agent room if they have an agent role
    if (user.role === 'AGENT') {
      socket.join(`agent:${user.userId}`);
    }

    // Handle client events
    socket.on('join_room', (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${user.email} joined room: ${roomId}`);
    });

    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
      console.log(`User ${user.email} left room: ${roomId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${user.email} (${socket.id}) - Reason: ${reason}`);
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to Corporate Agent Backend',
      userId: user.userId,
      timestamp: new Date().toISOString(),
    });
  });

  return io;
};

/**
 * Emit event to all connected clients
 */
export const emitToAll = (event: string, data: any): void => {
  if (io) {
    io.emit(event, data);
  }
};

/**
 * Emit event to specific user
 */
export const emitToUser = (userId: string, event: string, data: any): void => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Emit event to specific agent
 */
export const emitToAgent = (agentId: string, event: string, data: any): void => {
  if (io) {
    io.to(`agent:${agentId}`).emit(event, data);
  }
};

/**
 * Emit event to specific room
 */
export const emitToRoom = (room: string, event: string, data: any): void => {
  if (io) {
    io.to(room).emit(event, data);
  }
};

/**
 * Send notification to user
 */
export const sendNotification = (userId: string, notification: NotificationData): void => {
  if (io) {
    io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Broadcast appointment update
 */
export const broadcastAppointmentUpdate = (appointmentData: any): void => {
  const event: WebSocketEvent = {
    event: 'appointment_updated',
    data: appointmentData,
  };

  // Emit to all agents
  if (io) {
    io.emit('appointment_updated', appointmentData);
  }
};

/**
 * Broadcast new appointment creation
 */
export const broadcastAppointmentCreated = (appointmentData: any): void => {
  const event: WebSocketEvent = {
    event: 'appointment_created',
    data: appointmentData,
  };

  // Emit to all agents
  if (io) {
    io.emit('appointment_created', appointmentData);
  }

  // Send notification to specific agent if provided
  if (appointmentData.agentId) {
    sendNotification(appointmentData.agentId, {
      type: 'appointment_created',
      title: 'New Appointment',
      message: `New appointment created with Dr. ${appointmentData.doctorName}`,
      data: appointmentData,
    });
  }
};

/**
 * Broadcast payment update
 */
export const broadcastPaymentUpdate = (paymentData: any): void => {
  const event: WebSocketEvent = {
    event: 'payment_updated',
    data: paymentData,
  };

  if (io) {
    io.emit('payment_updated', paymentData);
  }

  // Send notification to agent
  if (paymentData.agentId) {
    sendNotification(paymentData.agentId, {
      type: 'payment_received',
      title: 'Payment Update',
      message: `Payment of Rs. ${paymentData.amount} ${paymentData.status}`,
      data: paymentData,
    });
  }
};

/**
 * Get WebSocket server instance
 */
export const getWebSocketServer = (): SocketIOServer | undefined => {
  return io;
};

/**
 * Get connected clients count
 */
export const getConnectedClientsCount = (): number => {
  return io ? io.sockets.sockets.size : 0;
};

/**
 * Get connected clients in a room
 */
export const getRoomClientsCount = (room: string): number => {
  if (!io) return 0;
  const roomSockets = io.sockets.adapter.rooms.get(room);
  return roomSockets ? roomSockets.size : 0;
};