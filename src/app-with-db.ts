import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Basic security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      success: true,
      message: 'Corporate Agent Backend is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'Connected to Neon PostgreSQL',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Corporate Agent Backend API',
    version: '1.0.0',
    status: 'Server is running successfully',
    endpoints: {
      health: '/health',
      dbTest: '/api/db-test',
      apiTest: '/api/test',
      doctors: '/api/doctors',
      agents: '/api/agents',
    },
  });
});

// Basic API test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
    cors: 'Configured for localhost:3000',
  });
});

// Database test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const agentCount = await prisma.agent.count();
    const doctorCount = await prisma.doctor.count();
    const appointmentCount = await prisma.appointment.count();

    res.json({
      success: true,
      message: 'Database connection successful',
      neonDatabase: 'Connected',
      statistics: {
        users: userCount,
        agents: agentCount,
        doctors: doctorCount,
        appointments: appointmentCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database query failed',
      error: error instanceof Error ? error.message : 'Unknown database error',
    });
  }
});

// Sample doctors endpoint for testing
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        specialty: true,
        hospital: true,
        consultationFee: true,
        rating: true,
        isActive: true,
      },
    });

    res.json({
      success: true,
      message: 'Doctors retrieved successfully',
      data: doctors,
      count: doctors.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve doctors',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Sample agents endpoint for testing
app.get('/api/agents', async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        companyName: true,
        email: true,
        phone: true,
        isActive: true,
      },
    });

    res.json({
      success: true,
      message: 'Agents retrieved successfully',
      data: agents,
      count: agents.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve agents',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/',
      '/health',
      '/api/test',
      '/api/db-test',
      '/api/doctors',
      '/api/agents',
    ],
  });
});

// Basic error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
  });
});

export default app;