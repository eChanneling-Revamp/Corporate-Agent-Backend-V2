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
    'https://corporate-agent-frontend-v2.vercel.app',
    'https://corporate-agent-frontend-v2-git-main-echanneling-revamp.vercel.app',
    'https://corporate-agent-frontend-v2-git-feat-prod-echanneling-revamp.vercel.app'
  ],
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
      error: error.message,
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
    const transformedPayments = payments.map((payment) => ({
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
      error: error.message,
    });
  }
});

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
        OR: [
          { payment: null },
          { payment: { status: 'PENDING' } }
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
      date: appointment.date.toISOString().split('T')[0],
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
      message: 'Failed to fetch unpaid appointments',
      error: error.message,
    });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    console.log('Creating new appointment:', req.body);
    const { doctorId, patientName, patientEmail, patientPhone, date, timeSlot, amount, paymentMethod } = req.body;
    
    // Get agent from token (simplified for demo)
    const agent = await prisma.agent.findFirst();
    
    const appointment = await prisma.appointment.create({
      data: {
        agentId: agent.id,
        doctorId,
        patientName,
        patientEmail,
        patientPhone,
        date: new Date(date),
        timeSlot,
        amount: parseFloat(amount),
        status: 'CONFIRMED'
      },
      include: {
        doctor: true
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
          companyName: agent.companyName || 'ABC Insurance Company',
          email: agent.email || 'corporateagent@slt.lk'
        }
      };

      // Send patient confirmation email
      console.log('[EMAIL] Sending appointment confirmation email...');
      const patientEmailResult = await emailService.sendAppointmentConfirmation(appointmentData);
      
      // Send corporate notification email
      console.log('[EMAIL] Sending corporate notification email...');
      const corporateEmailResult = await emailService.sendCorporateNotification(appointmentData);

      console.log('[SUCCESS] Email notifications processed:', { 
        patient: patientEmailResult.success, 
        corporate: corporateEmailResult.success 
      });
    } catch (emailError) {
      console.error('[WARNING] Email sending failed but appointment created:', emailError);
      // Don't fail the appointment creation if email fails
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

app.post('/api/appointments/bulk', async (req, res) => {
  try {
    console.log('Creating bulk appointments:', req.body);
    const appointments = req.body;
    const agent = await prisma.agent.findFirst();
    
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
            patientEmail: appt.patientEmail,
            patientPhone: appt.patientPhone,
            date: new Date(appt.date),
            timeSlot: appt.time,
            amount: doctor.consultationFee,
            status: 'CONFIRMED'
          },
          include: { doctor: true }
        });
        
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

          console.log(`[EMAIL] Sending confirmation email for appointment ${appointment.id}...`);
          const emailResult = await emailService.sendAppointmentConfirmation(appointmentData);
          if (emailResult.success) {
            emailsSent++;
          }
        } catch (emailError) {
          console.error(`[WARNING] Email failed for appointment ${appointment.id}:`, emailError);
        }
      }
    }

    console.log(`[SUCCESS] Bulk creation complete: ${createdAppointments.length} appointments, ${emailsSent} emails sent`);

    res.json({
      success: true,
      message: `${createdAppointments.length} appointments created successfully`,
      data: createdAppointments,
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

app.put('/api/appointments/confirm/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: { doctor: true }
    });

    res.json({
      success: true,
      message: 'Appointment confirmed successfully',
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

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        cancelReason: reason
      }
    });

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
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

app.get('/api/profile', async (req, res) => {
  try {
    const agent = await prisma.agent.findFirst({
      include: { user: true }
    });

    res.json({
      success: true,
      data: agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message,
    });
  }
});

app.put('/api/profile', async (req, res) => {
  try {
    const agent = await prisma.agent.findFirst();
    const updatedAgent = await prisma.agent.update({
      where: { id: agent.id },
      data: req.body,
      include: { user: true }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedAgent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
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