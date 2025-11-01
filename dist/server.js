"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
const websocket_1 = require("./utils/websocket");
const prisma_1 = require("./config/prisma");
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;
// Create HTTP server
const server = (0, http_1.createServer)(app_1.default);
// Initialize WebSocket
const io = (0, websocket_1.initWebSocket)(server);
// Database connection test
const connectDatabase = async () => {
    try {
        await prisma_1.prisma.$connect();
        console.log('✅ Database connected successfully');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};
// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    try {
        // Close WebSocket server
        if (io) {
            io.close();
            console.log('✅ WebSocket server closed');
        }
        // Close HTTP server
        server.close((err) => {
            if (err) {
                console.error('❌ Error closing HTTP server:', err);
                process.exit(1);
            }
            console.log('✅ HTTP server closed');
        });
        // Close database connection
        await prisma_1.prisma.$disconnect();
        console.log('✅ Database connection closed');
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
};
// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    process.exit(1);
});
// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error('💥 Unhandled Rejection:', err);
    process.exit(1);
});
// Start server
const startServer = async () => {
    try {
        // Connect to database
        await connectDatabase();
        // Start HTTP server
        server.listen(PORT, () => {
            console.log('🚀 Corporate Agent Backend Server started');
            console.log(`📡 HTTP Server running on port ${PORT}`);
            console.log(`🔌 WebSocket Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);
            console.log(`📖 API Base URL: http://localhost:${PORT}/api`);
            if (process.env.NODE_ENV === 'development') {
                console.log(`🔧 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
            }
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use`);
                process.exit(1);
            }
            else {
                console.error('❌ Server error:', err);
                process.exit(1);
            }
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
// Start the server
startServer();
//# sourceMappingURL=server.js.map