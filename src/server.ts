import { createServer } from 'http';
import app from './app';
import { initWebSocket } from './utils/websocket';
import { prisma } from './config/prisma';
import { backupScheduler } from './services/backupScheduler';

const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket
const io = initWebSocket(server);

// Database connection test
const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    // Stop backup scheduler
    backupScheduler.stop();
    console.log('✅ Backup scheduler stopped');

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
    await prisma.$disconnect();
    console.log('✅ Database connection closed');

    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
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
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Start automated backup scheduler (daily at 12:00 AM)
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_AUTO_BACKUP === 'true') {
      backupScheduler.start();
      console.log('✅ Automated backup scheduler started (Daily at 12:00 AM)');
      console.log('   - Database backups to Google Drive');
      console.log('   - Prisma schema backups with db pull');
    }

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

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();