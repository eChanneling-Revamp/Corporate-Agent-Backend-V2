const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const emailService = require('./services/emailService');

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Basic security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://corporate-agent-frontend-v2.vercel.app',
    'https://corporate-agent-frontend-v2-git-main-echanneling-revamp.vercel.app',
    'https://corporate-agent-frontend-v2-git-feat-prod-echanneling-revamp.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Cache-Control', 
    'Pragma',
    'Accept',
    'Accept-Language',
    'Accept-Encoding'
  ],
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

// ============================================
// JWT AUTHENTICATION MIDDLEWARE
// ============================================

// Middleware to verify JWT token and extract agent info
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const accessSecret = process.env.JWT_ACCESS_SECRET || 'corporate-agent-neon-jwt-access-secret-2024-production-ready-key-v1';
    
    jwt.verify(token, accessSecret, async (err, decoded) => {
      if (err) {
        console.log('[AUTH] Token verification failed:', err.message);
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      // Get agent from database using userId from token
      const agent = await prisma.agent.findFirst({
        where: { userId: decoded.userId },
        include: { user: true }
      });

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: 'Agent not found'
        });
      }

      // Attach agent info to request object
      req.agent = agent;
      req.user = decoded;
      
      console.log('[AUTH] Authenticated:', agent.name, '(', agent.email, ')');
      next();
    });
  } catch (error) {
    console.error('[AUTH] Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

// Optional authentication - continues even without token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token - use first agent as fallback (for backward compatibility)
      const agent = await prisma.agent.findFirst({
        include: { user: true },
        orderBy: { createdAt: 'asc' }
      });
      req.agent = agent;
      return next();
    }

    // Token exists - verify it
    const accessSecret = process.env.JWT_ACCESS_SECRET || 'corporate-agent-neon-jwt-access-secret-2024-production-ready-key-v1';
    
    jwt.verify(token, accessSecret, async (err, decoded) => {
      if (err) {
        // Invalid token - use fallback
        const agent = await prisma.agent.findFirst({
          include: { user: true },
          orderBy: { createdAt: 'asc' }
        });
        req.agent = agent;
        return next();
      }

      // Valid token - get agent
      const agent = await prisma.agent.findFirst({
        where: { userId: decoded.userId },
        include: { user: true }
      });

      req.agent = agent || await prisma.agent.findFirst({
        include: { user: true },
        orderBy: { createdAt: 'asc' }
      });
      
      req.user = decoded;
      next();
    });
  } catch (error) {
    // Error - use fallback
    const agent = await prisma.agent.findFirst({
      include: { user: true },
      orderBy: { createdAt: 'asc' }
    });
    req.agent = agent;
    next();
  }
};

// ============================================
// PUBLIC ENDPOINTS (No authentication required)
// ============================================

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

// Email service test endpoint
app.get('/api/test/email', async (req, res) => {
  try {
    console.log('[EMAIL] Testing email configuration...');
    const testResult = await emailService.testConnection();
    
    res.json({
      success: testResult.success,
      message: testResult.success ? 'Email service is configured and ready' : 'Email service configuration failed',
      details: testResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Email test error:', error);
    res.status(500).json({
      success: false,
      message: 'Email service test failed',
      error: error.message,
    });
  }
});

// Send test email endpoint
app.post('/api/test/send-email', async (req, res) => {
  try {
    const { to } = req.body;
    
    if (!to) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email address is required'
      });
    }

    const testAppointmentData = {
      patientName: 'John Doe',
      patientEmail: to,
      patientPhone: '+94771234567',
      doctorName: 'Dr. Smith Williams',
      specialty: 'Cardiology',
      hospital: 'Nawaloka Hospital',
      date: 'November 2, 2024',
      time: '2:00 PM',
      appointmentId: 'TEST-' + Date.now(),
      amount: 3500,
      corporateAgent: {
        companyName: 'ABC Insurance Company',
        email: 'corporateagent@slt.lk'
      }
    };

    console.log('[EMAIL] Sending test email to:', to);
    const emailResult = await emailService.sendAppointmentConfirmation(testAppointmentData);

    res.json({
      success: emailResult.success,
      message: emailResult.success ? 'Test email sent successfully' : 'Test email failed',
      details: emailResult
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Test email failed',
      error: error.message,
    });
  }
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
    const transformedDoctors = doctors.map((doctor) => ({
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
      error: error.message,
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
    const transformedAppointments = appointments.map((appointment) => ({
      id: appointment.id,
      doctorName: appointment.doctor.name,
      specialty: appointment.doctor.specialty,
      hospital: appointment.doctor.hospital,
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      patientPhone: appointment.patientPhone,
      patientNIC: appointment.patientNIC,
      date: appointment.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      time: appointment.timeSlot,
      status: appointment.status.toLowerCase(),
      amount: appointment.amount,
      paymentStatus: appointment.payment ? appointment.payment.status.toLowerCase() : 'pending',
      paymentMethod: appointment.paymentMethod, // Include payment method
      sltPhoneNumber: appointment.sltPhoneNumber,
      employeeNIC: appointment.employeeNIC,
      notes: appointment.notes || '',
      createdAt: appointment.createdAt
    }));

    res.json(transformedAppointments);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments from database',
      error: error.message,
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

    // Get revenue from CONFIRMED appointments (as per requirements)
    const revenueData = await prisma.appointment.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { amount: true }
    });

    console.log('Revenue calculated from confirmed appointments:', revenueData._sum.amount);

    // Get active doctors count
    const activeDoctors = await prisma.doctor.count({
      where: { isActive: true }
    });

    // Calculate growth percentages based on time periods
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Appointments growth (last 30 days vs previous 30 days)
    const [appointmentsLast30Days, appointmentsPrevious30Days] = await Promise.all([
      prisma.appointment.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      prisma.appointment.count({
        where: { 
          createdAt: { 
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo 
          } 
        }
      })
    ]);

    const appointmentsChange = appointmentsPrevious30Days > 0 
      ? ((appointmentsLast30Days - appointmentsPrevious30Days) / appointmentsPrevious30Days * 100).toFixed(1)
      : (appointmentsLast30Days > 0 ? 100 : 0);

    // Revenue growth (last 30 days vs previous 30 days)
    const [revenueLast30Days, revenuePrevious30Days] = await Promise.all([
      prisma.appointment.aggregate({
        where: { 
          status: 'CONFIRMED',
          createdAt: { gte: thirtyDaysAgo }
        },
        _sum: { amount: true }
      }),
      prisma.appointment.aggregate({
        where: { 
          status: 'CONFIRMED',
          createdAt: { 
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo 
          }
        },
        _sum: { amount: true }
      })
    ]);

    const revenueLastMonth = revenueLast30Days._sum.amount || 0;
    const revenuePreviousMonth = revenuePrevious30Days._sum.amount || 0;
    const revenueChange = revenuePreviousMonth > 0
      ? ((revenueLastMonth - revenuePreviousMonth) / revenuePreviousMonth * 100).toFixed(1)
      : (revenueLastMonth > 0 ? 100 : 0);

    // Doctor growth (doctors added in last 30 days)
    const doctorsAddedLast30Days = await prisma.doctor.count({
      where: { 
        isActive: true,
        createdAt: { gte: thirtyDaysAgo }
      }
    });
    
    const doctorsChange = activeDoctors > 0
      ? ((doctorsAddedLast30Days / activeDoctors) * 100).toFixed(1)
      : 0;

    const stats = {
      totalAppointments,
      pendingConfirmations,
      completedAppointments,
      cancelledAppointments,
      revenue: revenueData._sum.amount || 0,
      activeDoctors,
      appointmentsChange: parseFloat(appointmentsChange),
      revenueChange: parseFloat(revenueChange),
      doctorsChange: parseFloat(doctorsChange)
    };

    console.log('Dashboard stats calculated:', stats);

    res.json(stats);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats from database',
      error: error.message,
    });
  }
});

// Payments endpoint - serving real Neon PostgreSQL data
// REMOVED: Duplicate payments endpoint - using the one at line 1776 instead which includes more fields and proper response format

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('[AUTH] Login attempt for:', req.body.email);
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

    const accessToken = jwt.sign(payload, accessSecret, { 
      expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' 
    });

    const refreshToken = jwt.sign(payload, refreshSecret, { 
      expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' 
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    console.log('[SUCCESS] Login successful for:', user.email);

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
    console.error('[ERROR] Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
});

app.post('/api/auth/change-password', optionalAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    // Agent is already attached to req by optionalAuth middleware
    const agent = req.agent;

    if (!agent || !agent.user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, agent.user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: agent.user.id },
      data: { password: hashedPassword }
    });

    console.log('[AUTH] Password changed successfully for user:', agent.user.email);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('[ERROR] Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message,
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
      error: error.message,
    });
  }
});

// Missing API endpoints that frontend expects
app.get('/api/appointments/unpaid', async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        AND: [
          {
            OR: [
              { payment: null },
              { payment: { status: 'PENDING' } }
            ]
          },
          {
            status: {
              not: 'CANCELLED'
            }
          }
        ]
      },
      include: {
        doctor: true,
        payment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const transformedAppointments = appointments.map((appointment) => ({
      id: appointment.id,
      doctorName: appointment.doctor.name,
      specialty: appointment.doctor.specialty,
      hospital: appointment.doctor.hospital,
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      patientPhone: appointment.patientPhone,
      patientNIC: appointment.patientNIC,
      date: appointment.date.toISOString().split('T')[0],
      time: appointment.timeSlot,
      status: appointment.status.toLowerCase(),
      amount: appointment.amount,
      paymentStatus: appointment.payment ? appointment.payment.status.toLowerCase() : 'pending',
      paymentMethod: appointment.paymentMethod,
      sltPhoneNumber: appointment.sltPhoneNumber,
      employeeNIC: appointment.employeeNIC,
      notes: appointment.notes || '',
      createdAt: appointment.createdAt
    }));

    res.json(transformedAppointments);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unpaid appointments',
      error: error.message,
    });
  }
});

app.post('/api/appointments', optionalAuth, async (req, res) => {
  try {
    console.log('Creating new appointment:', req.body);
    const { 
      doctorId, 
      patientName, 
      patientNIC,
      patientEmail, 
      patientPhone, 
      date, 
      timeSlot, 
      amount, 
      paymentMethod,
      sltPhoneNumber,
      employeeNIC
    } = req.body;
    
    // Agent is already attached to req by optionalAuth middleware
    const agent = req.agent;
    
    if (!agent) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Validate required fields
    if (!patientNIC) {
      return res.status(400).json({
        success: false,
        message: 'Patient NIC is required'
      });
    }

    if (paymentMethod === 'BILL_TO_PHONE' && !sltPhoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'SLT phone number is required for Bill to Phone payment'
      });
    }
    
    const appointment = await prisma.appointment.create({
      data: {
        agentId: agent.id,
        doctorId,
        patientName,
        patientNIC,
        patientEmail,
        patientPhone,
        sltPhoneNumber: paymentMethod === 'BILL_TO_PHONE' ? sltPhoneNumber : null,
        employeeNIC: paymentMethod === 'DEDUCT_FROM_SALARY' ? employeeNIC : null,
        date: new Date(date),
        timeSlot,
        amount: parseFloat(amount),
        status: 'PENDING',
        paymentMethod: paymentMethod || 'BILL_TO_PHONE'
      },
      include: {
        doctor: true
      }
    });

    console.log('✅ Appointment created successfully with PENDING status:', {
      id: appointment.id,
      status: appointment.status,
      patient: appointment.patientName,
      doctor: appointment.doctor.name
    });

    // Send email notifications
    try {
      const appointmentData = {
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail,
        patientPhone: appointment.patientPhone,
        doctorName: appointment.doctor.name,
        specialty: appointment.doctor.specialty,
        hospital: appointment.doctor.hospital,
        date: appointment.date.toDateString(),
        time: appointment.timeSlot,
        appointmentId: appointment.id,
        amount: appointment.amount,
        corporateAgent: {
          companyName: agent.companyName || 'ABC Insurance Company',
          email: agent.email || 'corporateagent@slt.lk'
        }
      };

      // Send "appointment received" email (pending confirmation)
      console.log('[EMAIL] Sending appointment received email (pending confirmation)...');
      const patientEmailResult = await emailService.sendAppointmentReceived(appointmentData);
      
      if (patientEmailResult.success) {
        console.log('✅ Appointment received email sent successfully:', patientEmailResult.messageId);
      } else {
        console.log('⚠ Appointment received email failed:', patientEmailResult.error);
      }

      console.log('[SUCCESS] Email notification processed:', { 
        patient: patientEmailResult.success
      });
    } catch (emailError) {
      console.error('[WARNING] Email sending failed but appointment created:', emailError);
      // Don't fail the appointment creation if email fails
    }

    // Create notification for agent
    try {
      await prisma.notification.create({
        data: {
          agentId: agent.id,
          type: 'APPOINTMENT_RECEIVED',
          title: 'New Appointment Received',
          message: `${appointment.patientName} booked an appointment with ${appointment.doctor.name} for ${appointment.date.toDateString()} at ${appointment.timeSlot}`,
          appointmentId: appointment.id
        }
      });
      console.log('✅ Notification created for appointment');
    } catch (notifError) {
      console.error('[WARNING] Failed to create notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error) {
    console.error('Appointment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message,
    });
  }
});

app.post('/api/appointments/bulk', optionalAuth, async (req, res) => {
  try {
    console.log('Creating bulk appointments:', req.body);
    const appointments = req.body;
    
    // Agent is already attached to req by optionalAuth middleware
    const agent = req.agent;
    
    if (!agent) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const createdAppointments = [];
    let emailsSent = 0;
    
    for (const appt of appointments) {
      const doctor = await prisma.doctor.findFirst({
        where: { name: appt.doctorName }
      });
      
      if (doctor) {
        const appointment = await prisma.appointment.create({
          data: {
            agentId: agent.id,
            doctorId: doctor.id,
            patientName: appt.patientName,
            patientNIC: appt.patientNIC,
            patientEmail: appt.patientEmail,
            patientPhone: appt.patientPhone,
            date: new Date(appt.date),
            timeSlot: appt.time,
            amount: doctor.consultationFee,
            paymentMethod: appt.paymentMethod || 'BILL_TO_PHONE',
            sltPhoneNumber: appt.sltPhoneNumber,
            employeeNIC: appt.employeeNIC,
            status: 'PENDING'
          },
          include: { doctor: true }
        });

        console.log(`✅ Bulk appointment created with PENDING status: ${appointment.id} for ${appt.patientName}`);
        
        createdAppointments.push(appointment);

        // Send email notification for each appointment
        try {
          const appointmentData = {
            patientName: appointment.patientName,
            patientEmail: appointment.patientEmail,
            patientPhone: appointment.patientPhone,
            doctorName: appointment.doctor.name,
            specialty: appointment.doctor.specialty,
            hospital: appointment.doctor.hospital,
            date: appointment.date.toDateString(),
            time: appointment.timeSlot,
            appointmentId: appointment.id,
            amount: appointment.amount,
            corporateAgent: {
              companyName: agent.companyName || 'ABC Insurance Company',
              email: agent.email || 'corporateagent@slt.lk'
            }
          };

          console.log(`[EMAIL] Sending appointment received email for ${appointment.id} (pending confirmation)...`);
          const emailResult = await emailService.sendAppointmentReceived(appointmentData);
          if (emailResult.success) {
            emailsSent++;
            console.log(`✓ Appointment received email sent to ${appointment.patientEmail}`);
          } else {
            console.log(`⚠ Email failed:`, emailResult.error);
          }
        } catch (emailError) {
          console.error(`[WARNING] Email failed for appointment ${appointment.id}:`, emailError);
        }
      }
    }

    console.log(`[SUCCESS] Bulk creation complete: ${createdAppointments.length} appointments, ${emailsSent} emails sent`);

    // Create notification for bulk booking
    try {
      await prisma.notification.create({
        data: {
          agentId: agent.id,
          type: 'APPOINTMENT_RECEIVED',
          title: 'Bulk Appointments Created',
          message: `Successfully created ${createdAppointments.length} appointments in bulk booking`
        }
      });
      console.log('✅ Notification created for bulk appointments');
    } catch (notifError) {
      console.error('[WARNING] Failed to create notification:', notifError);
    }

    res.json({
      success: true,
      message: `${createdAppointments.length} appointments created successfully`,
      data: {
        created: createdAppointments,
        failed: []
      },
      emailNotifications: {
        sent: emailsSent,
        total: createdAppointments.length
      }
    });
  } catch (error) {
    console.error('Bulk appointment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bulk appointments',
      error: error.message,
    });
  }
});

// Appointment confirmation endpoint with email notifications
app.post('/api/appointments/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get appointment with full details for email
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: true,
        agent: true
      }
    });

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Create payment record for this appointment
    const payment = await prisma.payment.create({
      data: {
        amount: existingAppointment.amount,
        status: 'PAID',
        method: existingAppointment.paymentMethod || 'CARD', // Use paymentMethod from appointment
        transactionId: `TXN-${Date.now()}-${id.slice(0, 8)}`,
        agentId: existingAppointment.agentId,
        processedAt: new Date()
      }
    });

    // Update appointment status and link to payment
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { 
        status: 'CONFIRMED',
        paymentId: payment.id
      },
      include: { 
        doctor: true,
        agent: true,
        payment: true
      }
    });

    // Send email notifications
    try {
      const appointmentData = {
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail,
        patientPhone: appointment.patientPhone,
        doctorName: appointment.doctor.name,
        specialty: appointment.doctor.specialty,
        hospital: appointment.doctor.hospital,
        date: appointment.date.toDateString(),
        time: appointment.timeSlot,
        appointmentId: appointment.id,
        amount: appointment.amount,
        corporateAgent: {
          companyName: appointment.agent?.companyName || 'ABC Insurance Company',
          email: appointment.agent?.email || 'corporateagent@slt.lk'
        }
      };

      console.log('📧 Sending ACB confirmation emails...');
      
      // Send patient confirmation email
      const patientEmailResult = await emailService.sendAppointmentConfirmation(appointmentData);
      
      // Send corporate notification email
      const corporateEmailResult = await emailService.sendCorporateNotification(appointmentData);

      console.log('[SUCCESS] ACB confirmation emails sent:', { 
        patient: patientEmailResult.success, 
        corporate: corporateEmailResult.success 
      });

    } catch (emailError) {
      console.error('[ERROR] ACB confirmation email failed:', emailError);
      // Don't fail the operation if email fails
    }

    // Create notification for confirmation
    try {
      await prisma.notification.create({
        data: {
          agentId: appointment.agentId,
          type: 'APPOINTMENT_CONFIRMED',
          title: 'Appointment Confirmed',
          message: `Appointment for ${appointment.patientName} with ${appointment.doctor.name} has been confirmed for ${appointment.date.toDateString()} at ${appointment.timeSlot}`,
          appointmentId: appointment.id
        }
      });
      console.log('✅ Notification created for appointment confirmation');
    } catch (notifError) {
      console.error('[WARNING] Failed to create notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Appointment confirmed successfully and email notifications sent',
      data: appointment
    });
    
  } catch (error) {
    console.error('Appointment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm appointment',
      error: error.message,
    });
  }
});

// Appointment cancellation endpoint with email notifications
app.post('/api/appointments/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation reason is required and must be at least 5 characters'
      });
    }

    // Get appointment with full details for email
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: true,
        agent: true
      }
    });

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Update appointment status
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        cancelReason: reason.trim()
      },
      include: {
        doctor: true,
        agent: true
      }
    });

    // Send email notifications
    try {
      const appointmentData = {
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail,
        patientPhone: appointment.patientPhone,
        doctorName: appointment.doctor.name,
        specialty: appointment.doctor.specialty,
        hospital: appointment.doctor.hospital,
        date: appointment.date.toDateString(),
        time: appointment.timeSlot,
        appointmentId: appointment.id,
        amount: appointment.amount,
        cancelReason: reason.trim(),
        corporateAgent: {
          companyName: appointment.agent?.companyName || 'ABC Insurance Company',
          email: appointment.agent?.email || 'corporateagent@slt.lk'
        }
      };

      console.log('📧 Sending ACB cancellation emails...');

      // Send patient cancellation email
      const patientEmailResult = await emailService.sendAppointmentCancellation(appointmentData);
      
      // Send corporate cancellation notification
      const corporateEmailResult = await emailService.sendCorporateCancellationNotification(appointmentData);

      console.log('[SUCCESS] ACB cancellation emails sent:', { 
        patient: patientEmailResult.success, 
        corporate: corporateEmailResult.success 
      });

    } catch (emailError) {
      console.error('[ERROR] ACB cancellation email failed:', emailError);
      // Don't fail the operation if email fails
    }

    // Create notification for cancellation
    try {
      await prisma.notification.create({
        data: {
          agentId: appointment.agentId,
          type: 'APPOINTMENT_CANCELLED',
          title: 'Appointment Cancelled',
          message: `Appointment for ${appointment.patientName} with ${appointment.doctor.name} on ${appointment.date.toDateString()} at ${appointment.timeSlot} has been cancelled. Reason: ${reason.trim()}`,
          appointmentId: appointment.id
        }
      });
      console.log('✅ Notification created for appointment cancellation');
    } catch (notifError) {
      console.error('[WARNING] Failed to create notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully and email notifications sent',
      data: appointment
    });
    
  } catch (error) {
    console.error('Appointment cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error.message,
    });
  }
});

// GET profile - uses optionalAuth for backward compatibility
app.get('/api/profile', optionalAuth, async (req, res) => {
  try {
    // Agent is already attached to req by optionalAuth middleware
    const agent = req.agent;

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Fetch agent with user data to get login email
    const agentWithUser = await prisma.agent.findUnique({
      where: { id: agent.id },
      include: { user: true }
    });

    console.log('[PROFILE] Returning agent:', agentWithUser.name, '(ID:', agentWithUser.id.substring(0, 8) + '...)');

    res.json({
      success: true,
      data: {
        ...agentWithUser,
        loginEmail: agentWithUser.user.email // Include login email for frontend
      }
    });
  } catch (error) {
    console.error('[ERROR] Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
});

// PUT profile - uses optionalAuth for backward compatibility
app.put('/api/profile', optionalAuth, async (req, res) => {
  try {
    // Agent is already attached to req by optionalAuth middleware
    const agent = req.agent;

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // If email is being updated, also update the user's login email
    if (req.body.email && req.body.email !== agent.email) {
      console.log('[PROFILE] Email change detected:', agent.email, '->', req.body.email);
      
      // Check if the new email is already taken by another user
      const existingUser = await prisma.user.findUnique({
        where: { email: req.body.email }
      });

      if (existingUser && existingUser.id !== agent.userId) {
        return res.status(400).json({
          success: false,
          message: 'This email is already in use by another account'
        });
      }

      // Update both User email (for login) and Agent email (for contact)
      await prisma.user.update({
        where: { id: agent.userId },
        data: { email: req.body.email }
      });

      console.log('[PROFILE] Updated user login email to:', req.body.email);
    }

    const updatedAgent = await prisma.agent.update({
      where: { id: agent.id },
      data: req.body,
      include: { user: true }
    });

    console.log('[PROFILE] Updated agent:', updatedAgent.name);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...updatedAgent,
        loginEmail: updatedAgent.user.email // Include the updated login email
      }
    });
  } catch (error) {
    console.error('[ERROR] Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
});

// Get notifications for agent
app.get('/api/notifications', optionalAuth, async (req, res) => {
  try {
    // Agent is already attached to req by optionalAuth middleware
    const agent = req.agent;
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
    }

    const notifications = await prisma.notification.findMany({
      where: { agentId: agent.id },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to 50 most recent
    });

    const unreadCount = await prisma.notification.count({
      where: {
        agentId: agent.id,
        isRead: false
      }
    });

    res.json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (error) {
    console.error('[ERROR] Failed to fetch notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
});

// Mark notification as read
app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('[ERROR] Failed to mark notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message,
    });
  }
});

// Mark all notifications as read
app.patch('/api/notifications/read-all', optionalAuth, async (req, res) => {
  try {
    // Agent is already attached to req by optionalAuth middleware
    const agent = req.agent;
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
    }

    await prisma.notification.updateMany({
      where: {
        agentId: agent.id,
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('[ERROR] Failed to mark all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message,
    });
  }
});

// ==================== REPORTS ENDPOINTS ====================

// GET all reports for agent
app.get('/api/reports', optionalAuth, async (req, res) => {
  try {
    const agent = req.agent;

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const reports = await prisma.report.findMany({
      where: { agentId: agent.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`[REPORTS] Found ${reports.length} reports for agent ${agent.id}`);

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('[ERROR] Failed to fetch reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error.message,
    });
  }
});

// POST - Generate a new report
app.post('/api/reports/generate', optionalAuth, async (req, res) => {
  try {
    const agent = req.agent;

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const { reportType, dateFrom, dateTo, filters } = req.body;

    console.log('[REPORTS] Generating report:', { reportType, dateFrom, dateTo, agentId: agent.id });

    // Build date range - Use UTC to avoid timezone issues
    // Input dates are in YYYY-MM-DD format, appointments are stored at UTC midnight
    const dateFilter = {};
    if (dateFrom) {
      // Parse as UTC date at start of day
      const fromDate = new Date(dateFrom + 'T00:00:00.000Z');
      dateFilter.gte = fromDate;
      console.log('[REPORTS] Date from (UTC):', fromDate.toISOString());
    }
    if (dateTo) {
      // Parse as UTC date at end of day
      const toDate = new Date(dateTo + 'T23:59:59.999Z');
      dateFilter.lte = toDate;
      console.log('[REPORTS] Date to (UTC):', toDate.toISOString());
    }

    // Fetch appointments for the date range
    const appointments = await prisma.appointment.findMany({
      where: {
        agentId: agent.id,
        date: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
      },
      include: {
        doctor: true,
        payment: true
      },
      orderBy: { date: 'desc' }
    });

    console.log(`[REPORTS] Found ${appointments.length} appointments for agent ${agent.id} (${agent.name})`);
    console.log('[REPORTS] Agent email:', agent.email);
    console.log('[REPORTS] Date filter applied:', dateFilter);
    if (appointments.length > 0) {
      console.log('[REPORTS] First appointment date:', appointments[0].date);
      console.log('[REPORTS] Last appointment date:', appointments[appointments.length - 1].date);
      console.log('[REPORTS] Sample statuses:', appointments.slice(0, 5).map(a => ({ status: a.status, date: a.date, amount: a.amount, patient: a.patientName })));
    } else {
      // Debug: Let's check if there are ANY appointments for this agent
      const totalForAgent = await prisma.appointment.count({ where: { agentId: agent.id } });
      console.log('[REPORTS] DEBUG: Total appointments for this agent (no date filter):', totalForAgent);
      
      // Check a few recent appointments to see their dates
      const recentApts = await prisma.appointment.findMany({
        where: { agentId: agent.id },
        take: 5,
        orderBy: { date: 'desc' },
        select: { date: true, patientName: true, status: true }
      });
      console.log('[REPORTS] DEBUG: Recent appointments:', recentApts);
    }

    let reportData = {};
    let title = '';

    switch (reportType) {
      case 'appointments':
        reportData = {
          totalAppointments: appointments.length,
          confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
          pending: appointments.filter(a => a.status === 'PENDING').length,
          cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
          completed: appointments.filter(a => a.status === 'COMPLETED').length,
          appointments: appointments.map(a => ({
            id: a.id,
            patientName: a.patientName,
            doctorName: a.doctor.name,
            hospital: a.doctor.hospital,
            date: a.date,
            status: a.status,
            amount: a.amount
          }))
        };
        title = `Appointments Report (${new Date(dateFrom).toLocaleDateString()} - ${new Date(dateTo).toLocaleDateString()})`;
        break;

      case 'revenue':
        // Revenue is calculated from CONFIRMED appointments (as per dashboard logic)
        const confirmedAppointments = appointments.filter(a => a.status === 'CONFIRMED');
        const totalRevenue = confirmedAppointments.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
        
        // Pending appointments that are not yet confirmed
        const pendingAppointments = appointments.filter(a => a.status === 'PENDING');
        const pendingRevenue = pendingAppointments.reduce((sum, a) => sum + (Number(a.amount) || 0), 0);
        
        // Cancelled/other appointments
        const otherAppointments = appointments.filter(a => a.status !== 'CONFIRMED' && a.status !== 'PENDING');

        reportData = {
          totalRevenue,
          pendingRevenue,
          paidCount: confirmedAppointments.length,
          pendingCount: pendingAppointments.length,
          averagePerAppointment: confirmedAppointments.length > 0 ? totalRevenue / confirmedAppointments.length : 0,
          revenueByMonth: {},
          payments: confirmedAppointments.map(a => ({
            date: a.date,
            amount: a.amount,
            patient: a.patientName,
            doctor: a.doctor?.name || 'Unknown',
            transactionId: a.payment?.transactionId || 'N/A',
            status: a.status
          }))
        };
        title = `Revenue Report (${new Date(dateFrom).toLocaleDateString()} - ${new Date(dateTo).toLocaleDateString()})`;
        break;

      case 'doctors':
        const doctorStats = {};
        appointments.forEach(apt => {
          if (!apt.doctor) {
            console.log('[REPORTS] Skipping appointment without doctor:', apt.id);
            return; // Skip if no doctor
          }
          
          const docName = apt.doctor.name;
          if (!doctorStats[docName]) {
            doctorStats[docName] = {
              name: docName,
              hospital: apt.doctor.hospital || 'Unknown',
              specialty: apt.doctor.specialty || 'General',
              totalAppointments: 0,
              confirmed: 0,
              cancelled: 0,
              totalRevenue: 0
            };
          }
          doctorStats[docName].totalAppointments++;
          if (apt.status === 'CONFIRMED') {
            doctorStats[docName].confirmed++;
            // Revenue is from CONFIRMED appointments
            doctorStats[docName].totalRevenue += (Number(apt.amount) || 0);
          }
          if (apt.status === 'CANCELLED') doctorStats[docName].cancelled++;
        });

        const doctorsArray = Object.values(doctorStats);
        console.log(`[REPORTS] Processed ${doctorsArray.length} doctors with data:`, doctorsArray.map(d => ({ name: d.name, revenue: d.totalRevenue })));
        
        reportData = {
          totalDoctors: doctorsArray.length,
          doctors: doctorsArray,
          topPerformers: doctorsArray.sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10)
        };
        title = `Doctor Performance Report (${new Date(dateFrom).toLocaleDateString()} - ${new Date(dateTo).toLocaleDateString()})`;
        break;

      default:
        reportData = { appointments: appointments.length };
        title = `Custom Report`;
    }

    // Save report to database
    console.log('[REPORTS] Saving report with data keys:', Object.keys(reportData));
    console.log('[REPORTS] Report data summary:', JSON.stringify(reportData).length, 'bytes');
    
    // Map frontend report types to database enum values
    const typeMapping = {
      'appointments': 'APPOINTMENTS',
      'revenue': 'REVENUE',
      'doctors': 'DOCTOR_PERFORMANCE'
    };
    const dbType = typeMapping[reportType] || (reportType ? reportType.toUpperCase() : 'APPOINTMENTS');
    
    const report = await prisma.report.create({
      data: {
        agentId: agent.id,
        type: dbType,
        title,
        data: reportData, // Prisma handles JSON serialization automatically
        parameters: {
          dateFrom,
          dateTo,
          filters: filters || {}
        }
      }
    });

    console.log('[REPORTS] Report generated successfully:', report.id);

    res.json({
      success: true,
      message: 'Report generated successfully',
      data: report
    });
  } catch (error) {
    console.error('[ERROR] Failed to generate report:', error);
    console.error('[ERROR] Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET specific report by ID
app.get('/api/reports/:id', optionalAuth, async (req, res) => {
  try {
    const agent = req.agent;
    const { id } = req.params;

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const report = await prisma.report.findFirst({
      where: {
        id,
        agentId: agent.id
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('[ERROR] Failed to fetch report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error.message,
    });
  }
});

// DELETE report
app.delete('/api/reports/:id', optionalAuth, async (req, res) => {
  try {
    const agent = req.agent;
    const { id } = req.params;

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Verify report belongs to agent
    const report = await prisma.report.findFirst({
      where: {
        id,
        agentId: agent.id
      }
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await prisma.report.delete({
      where: { id }
    });

    console.log('[REPORTS] Report deleted:', id);

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('[ERROR] Failed to delete report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error.message,
    });
  }
});

// ==================== ENHANCED PAYMENTS ENDPOINTS ====================

// GET payment statistics
app.get('/api/payments/stats', optionalAuth, async (req, res) => {
  try {
    const agent = req.agent;

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const payments = await prisma.payment.findMany({
      where: { agentId: agent.id },
      include: {
        appointment: true
      }
    });

    const stats = {
      totalRevenue: payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: payments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0),
      totalPayments: payments.length,
      paidCount: payments.filter(p => p.status === 'PAID').length,
      pendingCount: payments.filter(p => p.status === 'PENDING').length,
      failedCount: payments.filter(p => p.status === 'FAILED').length,
      averagePayment: payments.length > 0 ? payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0,
      paymentMethods: {
        card: payments.filter(p => p.method === 'CARD').length,
        bankTransfer: payments.filter(p => p.method === 'BANK_TRANSFER').length,
        cash: payments.filter(p => p.method === 'CASH').length,
        wallet: payments.filter(p => p.method === 'WALLET').length
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[ERROR] Failed to fetch payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics',
      error: error.message,
    });
  }
});

// GET payments with filtering
app.get('/api/payments', optionalAuth, async (req, res) => {
  try {
    const agent = req.agent;
    const { status, method, dateFrom, dateTo, search } = req.query;

    // Build where clause
    const whereClause = agent ? { agentId: agent.id } : {};

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    if (method) {
      whereClause.method = method.toUpperCase();
    }

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) whereClause.createdAt.gte = new Date(dateFrom);
      if (dateTo) whereClause.createdAt.lte = new Date(dateTo);
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
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

    console.log(`[PAYMENTS] Found ${payments.length} payments`);

    // Transform database payments to frontend format
    let transformedPayments = payments.map((payment) => ({
      id: payment.id,
      appointmentId: payment.appointment?.id || 'N/A',
      transactionId: payment.transactionId || `TXN-${payment.id.slice(0, 8)}`,
      method: payment.method.toLowerCase(),
      amount: payment.amount,
      status: payment.status.toLowerCase(),
      date: payment.createdAt.toISOString(),
      processedAt: payment.processedAt ? payment.processedAt.toISOString() : null,
      doctorName: payment.appointment?.doctor?.name || 'Unknown',
      patientName: payment.appointment?.patientName || 'Unknown',
      patientEmail: payment.appointment?.patientEmail || '',
      patientPhone: payment.appointment?.patientPhone || '',
      hospital: payment.appointment?.doctor?.hospital || 'Unknown',
      specialty: payment.appointment?.doctor?.specialty || 'Unknown',
      notes: payment.notes
    }));

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      transformedPayments = transformedPayments.filter(p =>
        p.transactionId.toLowerCase().includes(searchLower) ||
        p.patientName.toLowerCase().includes(searchLower) ||
        p.doctorName.toLowerCase().includes(searchLower) ||
        p.id.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: transformedPayments,
      total: transformedPayments.length
    });
  } catch (error) {
    console.error('[ERROR] Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments from database',
      error: error.message,
    });
  }
});

// GET specific payment by ID
app.get('/api/payments/:id', optionalAuth, async (req, res) => {
  try {
    const agent = req.agent;
    const { id } = req.params;

    const whereClause = { id };
    if (agent) {
      whereClause.agentId = agent.id;
    }

    const payment = await prisma.payment.findFirst({
      where: whereClause,
      include: {
        appointment: {
          include: {
            doctor: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: payment.id,
        appointmentId: payment.appointment?.id || 'N/A',
        transactionId: payment.transactionId || `TXN-${payment.id.slice(0, 8)}`,
        method: payment.method.toLowerCase(),
        amount: payment.amount,
        status: payment.status.toLowerCase(),
        date: payment.createdAt.toISOString(),
        processedAt: payment.processedAt ? payment.processedAt.toISOString() : null,
        doctorName: payment.appointment?.doctor?.name || 'Unknown',
        patientName: payment.appointment?.patientName || 'Unknown',
        patientEmail: payment.appointment?.patientEmail || '',
        patientPhone: payment.appointment?.patientPhone || '',
        hospital: payment.appointment?.doctor?.hospital || 'Unknown',
        specialty: payment.appointment?.doctor?.specialty || 'Unknown',
        notes: payment.notes
      }
    });
  } catch (error) {
    console.error('[ERROR] Failed to fetch payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: error.message,
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
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`[SERVER] Corporate Agent Backend Server running on port ${PORT}`);
  console.log(`[ENV] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[HEALTH] Health check: http://localhost:${PORT}/health`);
  console.log(`[AUTH] Authentication enabled with Neon database`);
});

module.exports = app;