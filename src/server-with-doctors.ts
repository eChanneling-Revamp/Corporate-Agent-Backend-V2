import { createServer } from 'http';
import app from './app-with-doctors';

const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = createServer(app);

// Handle process signals
process.on('SIGTERM', () => {
  console.log('\nSIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

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
server.listen(PORT, () => {
  console.log('🚀 Corporate Agent Backend Server with Database started');
  console.log(`📡 HTTP Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📖 API Test: http://localhost:${PORT}/api/test`);
  console.log(`🗄️ Database Test: http://localhost:${PORT}/api/db-test`);
  console.log(`👨‍⚕️ Doctors API: http://localhost:${PORT}/api/doctors`);
  
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