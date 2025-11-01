"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomClientsCount = exports.getConnectedClientsCount = exports.getWebSocketServer = exports.broadcastPaymentUpdate = exports.broadcastAppointmentCreated = exports.broadcastAppointmentUpdate = exports.sendNotification = exports.emitToRoom = exports.emitToAgent = exports.emitToUser = exports.emitToAll = exports.initWebSocket = void 0;
const socket_io_1 = require("socket.io");
const jwt_1 = require("./jwt");
let io;
const initWebSocket = (server) => {
    io = new socket_io_1.Server(server, {
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
            const decoded = jwt_1.JwtUtils.verifyAccessToken(token);
            socket.data.user = decoded;
            next();
        }
        catch (error) {
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
        socket.on('join_room', (roomId) => {
            socket.join(roomId);
            console.log(`User ${user.email} joined room: ${roomId}`);
        });
        socket.on('leave_room', (roomId) => {
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
exports.initWebSocket = initWebSocket;
/**
 * Emit event to all connected clients
 */
const emitToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};
exports.emitToAll = emitToAll;
/**
 * Emit event to specific user
 */
const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};
exports.emitToUser = emitToUser;
/**
 * Emit event to specific agent
 */
const emitToAgent = (agentId, event, data) => {
    if (io) {
        io.to(`agent:${agentId}`).emit(event, data);
    }
};
exports.emitToAgent = emitToAgent;
/**
 * Emit event to specific room
 */
const emitToRoom = (room, event, data) => {
    if (io) {
        io.to(room).emit(event, data);
    }
};
exports.emitToRoom = emitToRoom;
/**
 * Send notification to user
 */
const sendNotification = (userId, notification) => {
    if (io) {
        io.to(`user:${userId}`).emit('notification', {
            ...notification,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.sendNotification = sendNotification;
/**
 * Broadcast appointment update
 */
const broadcastAppointmentUpdate = (appointmentData) => {
    const event = {
        event: 'appointment_updated',
        data: appointmentData,
    };
    // Emit to all agents
    if (io) {
        io.emit('appointment_updated', appointmentData);
    }
};
exports.broadcastAppointmentUpdate = broadcastAppointmentUpdate;
/**
 * Broadcast new appointment creation
 */
const broadcastAppointmentCreated = (appointmentData) => {
    const event = {
        event: 'appointment_created',
        data: appointmentData,
    };
    // Emit to all agents
    if (io) {
        io.emit('appointment_created', appointmentData);
    }
    // Send notification to specific agent if provided
    if (appointmentData.agentId) {
        (0, exports.sendNotification)(appointmentData.agentId, {
            type: 'appointment_created',
            title: 'New Appointment',
            message: `New appointment created with Dr. ${appointmentData.doctorName}`,
            data: appointmentData,
        });
    }
};
exports.broadcastAppointmentCreated = broadcastAppointmentCreated;
/**
 * Broadcast payment update
 */
const broadcastPaymentUpdate = (paymentData) => {
    const event = {
        event: 'payment_updated',
        data: paymentData,
    };
    if (io) {
        io.emit('payment_updated', paymentData);
    }
    // Send notification to agent
    if (paymentData.agentId) {
        (0, exports.sendNotification)(paymentData.agentId, {
            type: 'payment_received',
            title: 'Payment Update',
            message: `Payment of Rs. ${paymentData.amount} ${paymentData.status}`,
            data: paymentData,
        });
    }
};
exports.broadcastPaymentUpdate = broadcastPaymentUpdate;
/**
 * Get WebSocket server instance
 */
const getWebSocketServer = () => {
    return io;
};
exports.getWebSocketServer = getWebSocketServer;
/**
 * Get connected clients count
 */
const getConnectedClientsCount = () => {
    return io ? io.sockets.sockets.size : 0;
};
exports.getConnectedClientsCount = getConnectedClientsCount;
/**
 * Get connected clients in a room
 */
const getRoomClientsCount = (room) => {
    if (!io)
        return 0;
    const roomSockets = io.sockets.adapter.rooms.get(room);
    return roomSockets ? roomSockets.size : 0;
};
exports.getRoomClientsCount = getRoomClientsCount;
//# sourceMappingURL=websocket.js.map