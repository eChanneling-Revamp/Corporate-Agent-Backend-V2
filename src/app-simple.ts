import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, PaymentStatus } from '@prisma/client';
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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma'],
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
    
    const { status } = req.query;
    
    // Build where clause based on query parameters
    const whereClause: any = {};
    if (status && typeof status === 'string') {
      whereClause.status = status.toUpperCase();
    }
    
    const appointments = await prisma.appointment.findMany({
      where: whereClause,
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
    const transformedAppointments = appointments.map((appointment: any) => {
      const status = appointment.status.toLowerCase();
      console.log(`Appointment ${appointment.id}: status=${appointment.status} (${status}), patient=${appointment.patientName}`);
      
      return {
        id: appointment.id,
        doctorName: appointment.doctor.name,
        specialty: appointment.doctor.specialty,
        hospital: appointment.doctor.hospital,
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail,
        patientPhone: appointment.patientPhone,
        date: appointment.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        time: appointment.timeSlot,
        status: status,
        amount: appointment.amount,
        paymentStatus: appointment.payment ? appointment.payment.status.toLowerCase() : 'pending',
        notes: appointment.notes || '',
        createdAt: appointment.createdAt
      };
    });

    console.log(`Returning ${transformedAppointments.length} appointments with statuses:`, 
      transformedAppointments.map(a => `${a.id}:${a.status}`).join(', '));

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

// Get unpaid appointments for ACB confirmation
app.get('/api/appointments/unpaid', async (req, res) => {
  try {
    console.log('API call to /api/appointments/unpaid');
    
    // Add no-cache headers to prevent stale data
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
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
            status: 'PENDING'
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
      date: appointment.date.toISOString().split('T')[0],
      time: appointment.timeSlot,
      status: appointment.status.toLowerCase(),
      amount: appointment.amount,
      paymentStatus: appointment.payment ? appointment.payment.status.toLowerCase() : 'pending',
      notes: appointment.notes || '',
      createdAt: appointment.createdAt
    }));

    console.log(`Found ${appointments.length} unpaid appointments`);
    res.json(transformedAppointments);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unpaid appointments',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create appointment endpoint
app.post('/api/appointments', async (req, res) => {
  try {
    console.log('Creating new appointment:', req.body);
    
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

    console.log('✅ Appointment created successfully with PENDING status:', {
      id: appointment.id,
      status: appointment.status,
      patient: appointment.patientName,
      doctor: doctor.name
    });

    // Send "appointment received" email (pending confirmation)
    try {
      console.log('Sending appointment received email to:', patientEmail);
      
      const emailData = {
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail,
        patientPhone: appointment.patientPhone,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        hospital: doctor.hospital,
        date: appointment.date.toDateString(),
        time: appointment.timeSlot,
        appointmentId: appointment.id,
        amount: appointment.amount,
        corporateAgent: {
          companyName: defaultAgent.companyName || 'ABC Insurance Company',
          email: defaultAgent.email || 'corporateagent@slt.lk'
        }
      };

      console.log('Sending appointment received email via emailService...');
      const emailResult = await emailService.sendAppointmentReceived(emailData);
      
      if (emailResult.success) {
        console.log('✓ Appointment received email sent successfully:', emailResult.messageId);
      } else {
        console.log('⚠ Appointment received email failed:', emailResult.error);
      }
      
    } catch (emailError) {
      console.error('ERROR: Failed to send email:', emailError);
      console.error('Email error details:', emailError instanceof Error ? emailError.message : emailError);
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
    console.error('Appointment creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Bulk create appointments endpoint
app.post('/api/appointments/bulk', async (req, res) => {
  try {
    console.log('Bulk creating appointments:', req.body);
    
    const appointments = req.body;
    
    if (!Array.isArray(appointments) || appointments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: expected array of appointments'
      });
    }

    const results = {
      created: [] as any[],
      failed: [] as any[]
    };

    // Get default agent
    const defaultAgent = await prisma.agent.findFirst({
      where: { isActive: true }
    });

    if (!defaultAgent) {
      return res.status(400).json({
        success: false,
        message: 'No active agent found'
      });
    }

    // Process each appointment
    for (const apt of appointments) {
      try {
        const { doctorName, patientName, patientEmail, patientPhone, date, time } = apt;

        // Validate required fields
        if (!doctorName || !patientName || !patientEmail || !patientPhone || !date || !time) {
          results.failed.push({
            data: apt,
            error: 'Missing required fields'
          });
          continue;
        }

        // Find doctor by name
        const doctor = await prisma.doctor.findFirst({
          where: { 
            name: doctorName,
            isActive: true 
          }
        });

        if (!doctor) {
          results.failed.push({
            data: apt,
            error: `Doctor ${doctorName} not found`
          });
          continue;
        }

        // Check if time slot is available
        const existingAppointment = await prisma.appointment.findFirst({
          where: {
            doctorId: doctor.id,
            date: new Date(date),
            timeSlot: time,
            status: { in: ['PENDING', 'CONFIRMED'] }
          }
        });

        if (existingAppointment) {
          results.failed.push({
            data: apt,
            error: 'Time slot not available'
          });
          continue;
        }

        // Create appointment
        const appointment = await prisma.appointment.create({
          data: {
            agentId: defaultAgent.id,
            doctorId: doctor.id,
            patientName,
            patientEmail,
            patientPhone,
            date: new Date(date),
            timeSlot: time,
            amount: doctor.consultationFee,
            notes: '',
            status: 'PENDING'
          },
          include: {
            doctor: true,
            agent: true
          }
        });

        console.log(`✅ Bulk appointment created with PENDING status: ${appointment.id} for ${patientName}`);

        results.created.push({
          id: appointment.id,
          doctorName: doctor.name,
          patientName: appointment.patientName,
          date: appointment.date.toISOString().split('T')[0],
          time: appointment.timeSlot,
          status: appointment.status
        });

        // Send "appointment received" email (pending confirmation)
        try {
          const nodemailer = require('nodemailer');
          
          if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            const transporter = nodemailer.createTransport({
              host: process.env.SMTP_HOST || 'smtp.gmail.com',
              port: process.env.SMTP_PORT || 587,
              secure: false,
              auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              },
            });

            const mailOptions = {
              from: process.env.EMAIL_FROM || 'echanneling.revamp@gmail.com',
              to: patientEmail,
              subject: 'Appointment Received - Confirmation Pending',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #f59e0b;">Appointment Received</h2>
                  <p>Dear ${patientName},</p>
                  <p>Your appointment request has been received and is <strong>pending confirmation</strong> by our corporate agent.</p>
                  <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #f59e0b;">
                    <p><strong>Doctor:</strong> ${doctor.name}</p>
                    <p><strong>Specialty:</strong> ${doctor.specialty}</p>
                    <p><strong>Hospital:</strong> ${doctor.hospital}</p>
                    <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${time}</p>
                    <p><strong>Consultation Fee:</strong> LKR ${doctor.consultationFee}</p>
                    <p><strong>Appointment ID:</strong> ${appointment.id}</p>
                    <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f59e0b;">
                      <strong>Status:</strong> <span style="background: #f59e0b; color: white; padding: 4px 12px; border-radius: 12px;">PENDING CONFIRMATION</span>
                    </p>
                  </div>
                  <p><strong>What happens next?</strong></p>
                  <ul>
                    <li>Your corporate agent will review and confirm your appointment</li>
                    <li>You will receive a confirmation email once approved</li>
                    <li>Payment is handled by your corporate agent</li>
                  </ul>
                  <p>Thank you for choosing our services!</p>
                  <hr>
                  <p style="font-size: 12px; color: #6b7280;">
                    This is an automated message from eChannelling Corporate Agent System.
                  </p>
                </div>
              `
            };

            await transporter.sendMail(mailOptions);
            console.log(`Appointment received email sent to ${patientEmail} for appointment ${appointment.id}`);
          }
        } catch (emailError) {
          console.error(`Email failed for appointment ${appointment.id}:`, emailError);
          // Don't fail the creation if email fails
        }

      } catch (error) {
        results.failed.push({
          data: apt,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`Bulk creation complete: ${results.created.length} created, ${results.failed.length} failed`);

    return res.status(201).json({
      success: true,
      message: `Bulk appointment creation complete. ${results.created.length} created, ${results.failed.length} failed`,
      data: results
    });

  } catch (error) {
    console.error('Bulk appointment creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create bulk appointments',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Cancel appointment endpoint
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

    console.log('Appointment cancelled successfully:', appointment.id);

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
          companyName: appointment.agent?.companyName || 'Corporate Agent',
          email: appointment.agent?.email || 'corporateagent@slt.lk'
        }
      };

      console.log('Sending ACB cancellation emails...');
      console.log('Email service configured:', process.env.SMTP_USER ? 'Yes' : 'No');

      // Send patient cancellation email
      const patientEmailResult = await emailService.sendAppointmentCancellation(appointmentData);
      console.log('Patient cancellation email result:', patientEmailResult);
      
      // Send corporate cancellation notification
      const corporateEmailResult = await emailService.sendCorporateCancellationNotification(appointmentData);
      console.log('Corporate cancellation email result:', corporateEmailResult);

      console.log('[SUCCESS] ACB cancellation emails sent:', { 
        patient: patientEmailResult.success, 
        corporate: corporateEmailResult.success 
      });

    } catch (emailError) {
      console.error('ERROR: ACB cancellation email failed:', emailError);
      console.error('Email error details:', emailError instanceof Error ? emailError.message : emailError);
      // Don't fail the operation if email fails
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: {
        id: appointment.id,
        status: appointment.status.toLowerCase(),
        cancelReason: appointment.cancelReason
      }
    });
    
  } catch (error) {
    console.error('Appointment cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Confirm appointment endpoint
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

    // Update appointment status
    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: { 
        doctor: true,
        agent: true 
      }
    });

    console.log('Appointment confirmed successfully:', appointment.id);

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
          companyName: appointment.agent?.companyName || 'Corporate Agent',
          email: appointment.agent?.email || 'corporateagent@slt.lk'
        }
      };

      console.log('Sending ACB confirmation emails...');
      console.log('Email service configured:', process.env.SMTP_USER ? 'Yes' : 'No');
      
      // Send patient confirmation email
      const patientEmailResult = await emailService.sendACBConfirmation(appointmentData);
      console.log('Patient confirmation email result:', patientEmailResult);
      
      // Send corporate notification email
      const corporateEmailResult = await emailService.sendCorporateNotification(appointmentData);
      console.log('Corporate notification email result:', corporateEmailResult);

      console.log('[SUCCESS] ACB confirmation emails sent:', { 
        patient: patientEmailResult.success, 
        corporate: corporateEmailResult.success 
      });

    } catch (emailError) {
      console.error('ERROR: ACB confirmation email failed:', emailError);
      console.error('Email error details:', emailError instanceof Error ? emailError.message : emailError);
      // Don't fail the operation if email fails
    }

    res.json({
      success: true,
      message: 'Appointment confirmed successfully',
      data: {
        id: appointment.id,
        status: appointment.status.toLowerCase()
      }
    });
    
  } catch (error) {
    console.error('Appointment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm appointment',
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

// Notifications endpoints - returning empty arrays for now (no notifications table populated)
app.get('/api/notifications', async (req, res) => {
  try {
    console.log('API call to /api/notifications');
    
    const { isRead, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // Return empty notifications array for now (data must be an array for frontend .slice())
    res.json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: [],
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/notifications/unread-count', async (req, res) => {
  try {
    console.log('API call to /api/notifications/unread-count');
    
    res.json({
      success: true,
      message: 'Unread count retrieved successfully',
      data: { count: 0 },
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    console.log('API call to /api/notifications/:id/read');
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: null,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.patch('/api/notifications/read-all', async (req, res) => {
  try {
    console.log('API call to /api/notifications/read-all');
    
    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { count: 0 },
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    console.log('API call to DELETE /api/notifications/:id');
    
    res.json({
      success: true,
      message: 'Notification deleted successfully',
      data: null,
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Profile endpoint
app.get('/api/profile', async (req, res) => {
  try {
    console.log('API call to /api/profile');
    
    // Get the first agent from the database (in production, use authenticated user)
    const agent = await prisma.agent.findFirst({
      include: {
        user: true,
      },
    });

    if (!agent) {
      // Return mock data if no agent exists
      return res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          name: 'SLT Agent',
          email: 'agent@slt.lk',
          companyName: 'Sri Lanka Telecom',
          phone: '+94 11 1234567',
          address: 'Colombo, Sri Lanka',
          createdAt: new Date('2025-01-01').toISOString(),
        },
      });
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        companyName: agent.companyName || 'Sri Lanka Telecom',
        phone: agent.phone || '+94 11 1234567',
        address: agent.address || 'Colombo, Sri Lanka',
        createdAt: agent.createdAt.toISOString(),
        loginEmail: agent.user?.email,
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Reports endpoints
app.get('/api/reports', async (req, res) => {
  try {
    console.log('API call to /api/reports');
    
    // Return empty reports for now
    res.json({
      success: true,
      data: [],
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.post('/api/reports/generate', async (req, res) => {
  try {
    console.log('API call to POST /api/reports/generate');
    const { reportType, dateFrom, dateTo, filters } = req.body;

    console.log('Generating report:', { reportType, dateFrom, dateTo });

    // Generate report based on type
    let reportData: any = {};
    let title = '';

    if (reportType === 'appointments') {
      const appointments = await prisma.appointment.findMany({
        where: {
          date: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo),
          },
        },
        include: {
          doctor: true,
          payment: true,
        },
        orderBy: {
          date: 'desc',
        },
      });

      reportData = {
        totalAppointments: appointments.length,
        byStatus: {
          pending: appointments.filter(a => a.status === 'PENDING').length,
          confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
          completed: appointments.filter(a => a.status === 'COMPLETED').length,
          cancelled: appointments.filter(a => a.status === 'CANCELLED').length,
        },
        appointments: appointments.map(a => ({
          id: a.id,
          patientName: a.patientName,
          doctorName: a.doctor.name,
          specialty: a.doctor.specialty,
          hospital: a.doctor.hospital,
          date: a.date,
          timeSlot: a.timeSlot,
          status: a.status,
          amount: a.amount,
          paymentStatus: a.payment?.status || 'PENDING',
        })),
      };
      title = `Appointments Report (${dateFrom} to ${dateTo})`;
    } else if (reportType === 'revenue') {
      const payments = await prisma.payment.findMany({
        where: {
          createdAt: {
            gte: new Date(dateFrom),
            lte: new Date(dateTo),
          },
        },
        include: {
          appointment: {
            include: {
              doctor: true,
            },
          },
        },
      });

      const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
      const paidRevenue = payments
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + p.amount, 0);

      reportData = {
        totalRevenue,
        paidRevenue,
        pendingRevenue: totalRevenue - paidRevenue,
        paymentCount: payments.length,
        byStatus: {
          paid: payments.filter(p => p.status === 'PAID').length,
          pending: payments.filter(p => p.status === 'PENDING').length,
          failed: payments.filter(p => p.status === 'FAILED').length,
        },
        payments: payments.map(p => {
          const appointment = Array.isArray(p.appointment) ? p.appointment[0] : p.appointment;
          return {
            id: p.id,
            amount: p.amount,
            status: p.status,
            method: p.method,
            transactionId: p.transactionId || 'N/A',
            date: p.createdAt,
            createdAt: p.createdAt,
            patient: appointment?.patientName || 'N/A',
            doctor: appointment?.doctor?.name || 'N/A',
            appointmentId: appointment?.id,
          };
        }),
      };
      title = `Revenue Report (${dateFrom} to ${dateTo})`;
    } else {
      // Generic report
      reportData = {
        message: 'Report type not yet implemented',
        type: reportType,
      };
      title = `${reportType} Report (${dateFrom} to ${dateTo})`;
    }

    const report = {
      id: `report_${Date.now()}`,
      type: reportType.toUpperCase(),
      title,
      data: reportData,
      parameters: { reportType, dateFrom, dateTo, filters },
      createdAt: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: 'Report generated successfully',
      data: report,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate report',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/api/reports/:id', async (req, res) => {
  try {
    console.log('API call to GET /api/reports/:id');
    
    // For now, return not found
    res.status(404).json({
      success: false,
      message: 'Report not found',
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.delete('/api/reports/:id', async (req, res) => {
  try {
    console.log('API call to DELETE /api/reports/:id');
    
    res.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Payment stats endpoint  
app.get('/api/payments/stats', async (req, res) => {
  try {
    console.log('API call to /api/payments/stats');
    
    // Get total revenue from PAID payments
    const paidStats = await prisma.payment.aggregate({
      where: { status: PaymentStatus.PAID },
      _sum: { amount: true },
      _count: { id: true },
    });

    // Get pending amount
    const pendingStats = await prisma.payment.aggregate({
      where: { status: PaymentStatus.PENDING },
      _sum: { amount: true },
      _count: { id: true },
    });

    // Get failed count
    const failedCount = await prisma.payment.count({
      where: { status: PaymentStatus.FAILED },
    });

    // Get total payments count
    const totalCount = await prisma.payment.count();

    const totalRevenue = paidStats._sum.amount || 0;
    const pendingAmount = pendingStats._sum.amount || 0;
    const paidCount = paidStats._count.id || 0;
    const pendingCount = pendingStats._count.id || 0;
    const averagePayment = paidCount > 0 ? totalRevenue / paidCount : 0;

    res.json({
      success: true,
      message: 'Payment stats retrieved successfully',
      data: {
        totalRevenue,
        pendingAmount,
        totalPayments: totalCount,
        paidCount,
        pendingCount,
        failedCount,
        averagePayment,
        paymentMethods: {
          card: 0,
          bankTransfer: 0,
          cash: 0,
          wallet: 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment stats',
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

    console.log('Login successful for:', user.email);

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
    console.error('Login error:', error);
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