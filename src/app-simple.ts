import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
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
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Corporate Agent Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Corporate Agent Backend API',
    version: '1.0.0',
    status: 'Server is running successfully',
  });
});

// Basic API test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
  });
});

// Doctors endpoint - serving real Neon PostgreSQL data
app.get('/api/doctors', async (req, res) => {
  try {
    console.log('API call to /api/doctors');
    
    const doctors = await prisma.doctor.findMany({
      where: {
        isActive: true
      }
    });

    console.log(`Found ${doctors.length} doctors in database`);

    // Transform database doctors to frontend format
    const transformedDoctors = doctors.map((doctor: any) => ({
      id: doctor.id,
      name: doctor.name,
      specialty: doctor.specialty,
      hospital: doctor.hospital,
      rating: doctor.rating || 4.5,
      fee: doctor.consultationFee || 3000,
      photo: doctor.photoUrl || '/api/placeholder/150/150',
      availableSlots: [
        {
          id: `${doctor.id}-slot1`,
          date: '2025-11-02',
          time: '09:00 AM',
          available: true
        },
        {
          id: `${doctor.id}-slot2`, 
          date: '2025-11-02',
          time: '02:00 PM',
          available: true
        }
      ]
    }));

    res.json(transformedDoctors);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors from database',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Appointments endpoint - serving real Neon PostgreSQL data
app.get('/api/appointments', async (req, res) => {
  try {
    console.log('API call to /api/appointments');
    
    const appointments = await prisma.appointment.findMany({
      include: {
        doctor: true,
        payment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${appointments.length} appointments in database`);

    // Transform database appointments to frontend format
    const transformedAppointments = appointments.map((appointment: any) => ({
      id: appointment.id,
      doctorName: appointment.doctor.name,
      specialty: appointment.doctor.specialty,
      hospital: appointment.doctor.hospital,
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      patientPhone: appointment.patientPhone,
      date: appointment.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      time: appointment.timeSlot,
      status: appointment.status.toLowerCase(),
      amount: appointment.amount,
      paymentStatus: appointment.payment ? appointment.payment.status.toLowerCase() : 'pending',
      notes: appointment.notes || '',
      createdAt: appointment.createdAt
    }));

    res.json(transformedAppointments);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments from database',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create appointment endpoint
app.post('/api/appointments', async (req, res) => {
  try {
    console.log('📅 Creating new appointment:', req.body);
    
    const {
      doctorId,
      patientName,
      patientEmail,
      patientPhone,
      date,
      timeSlot,
      notes
    } = req.body;

    // Validate required fields
    if (!doctorId || !patientName || !patientEmail || !patientPhone || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Get doctor info for fee calculation
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if time slot is available
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date: new Date(date),
        timeSlot,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'Time slot is not available'
      });
    }

    // For now, we'll use a default agent ID (first agent in the system)
    // In a real app, this would come from the authenticated user
    const defaultAgent = await prisma.agent.findFirst({
      where: { isActive: true }
    });

    if (!defaultAgent) {
      return res.status(400).json({
        success: false,
        message: 'No active agent found'
      });
    }

    // Create the appointment
    const appointment = await prisma.appointment.create({
      data: {
        agentId: defaultAgent.id,
        doctorId,
        patientName,
        patientEmail,
        patientPhone,
        date: new Date(date),
        timeSlot,
        amount: doctor.consultationFee,
        notes: notes || '',
        status: 'PENDING'
      },
      include: {
        doctor: true,
        agent: true
      }
    });

    console.log('✅ Appointment created successfully:', appointment.id);

    // Send email notification
    try {
      console.log('📧 Sending confirmation email to:', patientEmail);
      
      // Import nodemailer dynamically to avoid startup issues if not configured
      const nodemailer = require('nodemailer');
      
      // Create transporter
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Email content
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'echanneling.revamp@gmail.com',
        to: patientEmail,
        subject: 'Appointment Confirmation - eChannelling Corporate Agent',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Appointment Confirmation</h2>
            <p>Dear ${patientName},</p>
            <p>Your appointment has been successfully booked. Here are the details:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Doctor:</strong> ${doctor.name}</p>
              <p><strong>Specialty:</strong> ${doctor.specialty}</p>
              <p><strong>Hospital:</strong> ${doctor.hospital}</p>
              <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${timeSlot}</p>
              <p><strong>Consultation Fee:</strong> LKR ${doctor.consultationFee}</p>
              <p><strong>Appointment ID:</strong> ${appointment.id}</p>
            </div>
            <p><strong>Important:</strong> Please arrive 15 minutes before your scheduled time.</p>
            <p>If you need to cancel or reschedule, please contact us at least 24 hours in advance.</p>
            <p>Thank you for choosing our services!</p>
            <hr>
            <p style="font-size: 12px; color: #6b7280;">
              This is an automated message from eChannelling Corporate Agent System.<br>
              For support, contact: ${process.env.EMAIL_FROM}
            </p>
          </div>
        `
      };

      // Send email
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail(mailOptions);
        console.log('📧 Email notification sent successfully to:', patientEmail);
      } else {
        console.log('📧 Email service not configured, skipping email notification');
      }
      
    } catch (emailError) {
      console.error('📧 Failed to send email:', emailError);
      // Don't fail the appointment creation if email fails
    }

    return res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: {
        id: appointment.id,
        appointmentId: appointment.id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        hospital: doctor.hospital,
        patientName: appointment.patientName,
        date: appointment.date.toISOString().split('T')[0],
        time: appointment.timeSlot,
        amount: appointment.amount,
        status: appointment.status.toLowerCase()
      }
    });

  } catch (error) {
    console.error('❌ Appointment creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Dashboard stats endpoint - serving real Neon PostgreSQL data
app.get('/api/dashboard', async (req, res) => {
  try {
    console.log('API call to /api/dashboard');
    
    // Get appointment counts by status
    const [totalAppointments, pendingConfirmations, completedAppointments, cancelledAppointments] = await Promise.all([
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.appointment.count({ where: { status: 'CANCELLED' } })
    ]);

    // Get revenue from paid appointments
    const revenueData = await prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true }
    });

    // Get active doctors count
    const activeDoctors = await prisma.doctor.count({
      where: { isActive: true }
    });

    const stats = {
      totalAppointments,
      pendingConfirmations,
      completedAppointments,
      cancelledAppointments,
      revenue: revenueData._sum.amount || 0,
      activeDoctors,
      appointmentsChange: 12.5, // Mock data for now
      revenueChange: 8.3 // Mock data for now
    };

    console.log('Dashboard stats calculated:', stats);

    res.json(stats);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats from database',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Payments endpoint - serving real Neon PostgreSQL data
app.get('/api/payments', async (req, res) => {
  try {
    console.log('API call to /api/payments');
    
    const payments = await prisma.payment.findMany({
      include: {
        appointment: {
          include: {
            doctor: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${payments.length} payments in database`);

    // Transform database payments to frontend format
    const transformedPayments = payments.map((payment: any) => ({
      id: payment.id,
      appointmentId: payment.appointment?.id || 'N/A',
      transactionId: payment.transactionId || `TXN-${payment.id.slice(0, 8)}`,
      method: payment.method.toLowerCase(),
      amount: payment.amount,
      status: payment.status.toLowerCase(),
      date: payment.createdAt.toISOString(),
      doctorName: payment.appointment?.doctor?.name || 'Unknown',
      patientName: payment.appointment?.patientName || 'Unknown'
    }));

    res.json(transformedPayments);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments from database',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt for:', req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user with agent data
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        agent: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessSecret = process.env.JWT_ACCESS_SECRET || 'corporate-agent-neon-jwt-access-secret-2024-production-ready-key-v1';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'corporate-agent-neon-jwt-refresh-secret-2024-production-ready-key-v1';

    const accessToken = jwt.sign(payload, accessSecret as string, { 
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' 
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, refreshSecret as string, { 
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' 
    } as jwt.SignOptions);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    console.log('✅ Login successful for:', user.email);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        agent: user.agent ? {
          id: user.agent.id,
          name: user.agent.name,
          companyName: user.agent.companyName,
          email: user.agent.email,
        } : null,
        tokens: {
          accessToken,
          refreshToken,
        },
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    return res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Handle 404 errors
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
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