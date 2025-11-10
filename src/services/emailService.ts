import nodemailer from 'nodemailer';
import handlebars from 'handlebars';

interface AppointmentEmailData {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  date: string;
  time: string;
  appointmentId: string;
  amount: number;
  corporateAgent: {
    companyName: string;
    email: string;
  };
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Initialize transporter with SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Send appointment confirmation email
  async sendAppointmentConfirmation(appointmentData: AppointmentEmailData): Promise<EmailResult> {
    try {
      const {
        patientName,
        patientEmail,
        doctorName,
        specialty,
        hospital,
        date,
        time,
        appointmentId,
        amount,
        corporateAgent
      } = appointmentData;

      const mailOptions = {
        from: `"eChannelling Corporate Agent" <${process.env.SMTP_USER}>`,
        to: patientEmail,
        subject: `Appointment Confirmation - Dr. ${doctorName}`,
        html: this.generateAppointmentConfirmationHTML(appointmentData),
        text: this.generateAppointmentConfirmationText(appointmentData)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('[SUCCESS] Appointment confirmation email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('[ERROR] Email sending failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Send notification to corporate agent
  async sendCorporateNotification(appointmentData: AppointmentEmailData): Promise<EmailResult> {
    try {
      const { corporateAgent, patientName, doctorName, date, time } = appointmentData;

      const mailOptions = {
        from: `"eChannelling System" <${process.env.SMTP_USER}>`,
        to: corporateAgent.email,
        subject: `New Appointment Booking - ${patientName}`,
        html: this.generateCorporateNotificationHTML(appointmentData),
        text: `New appointment booked for ${patientName} with ${doctorName} on ${date} at ${time}`
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('[SUCCESS] Corporate notification sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('[ERROR] Corporate notification failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Send ACB confirmation email (when agent confirms pending appointment)
  async sendACBConfirmation(appointmentData: AppointmentEmailData): Promise<EmailResult> {
    try {
      const {
        patientName,
        patientEmail,
        doctorName,
        specialty,
        hospital,
        date,
        time,
        appointmentId,
        amount,
        corporateAgent
      } = appointmentData;

      const mailOptions = {
        from: `"eChannelling Corporate Agent" <${process.env.SMTP_USER}>`,
        to: patientEmail,
        subject: `Appointment Confirmed - Dr. ${doctorName}`,
        html: this.generateACBConfirmationHTML(appointmentData),
        text: this.generateACBConfirmationText(appointmentData)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('[SUCCESS] ACB confirmation email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('[ERROR] ACB confirmation email failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Send appointment received email (initial booking notification - pending confirmation)
  async sendAppointmentReceived(appointmentData: AppointmentEmailData): Promise<EmailResult> {
    try {
      const {
        patientName,
        patientEmail,
        doctorName,
        specialty,
        hospital,
        date,
        time,
        appointmentId,
        amount,
        corporateAgent
      } = appointmentData;

      const mailOptions = {
        from: `"eChannelling Corporate Agent" <${process.env.SMTP_USER}>`,
        to: patientEmail,
        subject: `Appointment Received - Confirmation Pending - Dr. ${doctorName}`,
        html: this.generateAppointmentReceivedHTML(appointmentData),
        text: this.generateAppointmentReceivedText(appointmentData)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('[SUCCESS] Appointment received email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('[ERROR] Appointment received email failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Generate HTML template for appointment confirmation
  private generateAppointmentConfirmationHTML(data: AppointmentEmailData): string {
    const {
      patientName,
      doctorName,
      specialty,
      hospital,
      date,
      time,
      appointmentId,
      amount,
      corporateAgent
    } = data;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Confirmation</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #0891b2 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .appointment-card { background: #f0f9ff; border: 1px solid #0891b2; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #6b7280; }
            .highlight { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .btn { display: inline-block; background: #0891b2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Appointment Confirmed</h1>
                <p>Your appointment has been successfully booked</p>
            </div>
            
            <div class="content">
                <h2>Dear ${patientName},</h2>
                <p>Your appointment has been confirmed. Please find your appointment details below:</p>
                
                <div class="appointment-card">
                    <h3 style="margin-top: 0; color: #0891b2;">Appointment Details</h3>
                    
                    <div class="info-row">
                        <span class="label">Doctor:</span>
                        <span class="value"><strong>${doctorName}</strong></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Specialty:</span>
                        <span class="value">${specialty}</span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Hospital:</span>
                        <span class="value">${hospital}</span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Date:</span>
                        <span class="value"><strong>${date}</strong></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Time:</span>
                        <span class="value"><strong>${time}</strong></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Appointment ID:</span>
                        <span class="value"><code>${appointmentId}</code></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Consultation Fee:</span>
                        <span class="value"><strong>Rs. ${amount.toLocaleString()}</strong></span>
                    </div>
                    
                    <div class="info-row" style="border-bottom: none;">
                        <span class="label">Payment:</span>
                        <span class="highlight">Covered by ${corporateAgent.companyName}</span>
                    </div>
                </div>
                
                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #92400e;">Important Instructions:</h4>
                    <ul style="margin: 0; color: #92400e;">
                        <li>Please arrive <strong>15 minutes early</strong> for registration</li>
                        <li>Bring a valid ID and this appointment confirmation</li>
                        <li>If you need to reschedule, contact ${corporateAgent.companyName} at least 24 hours in advance</li>
                        <li>Payment is handled by your corporate agent - no payment required at the hospital</li>
                    </ul>
                </div>
                
                <p><strong>Need to make changes?</strong><br>
                Contact ${corporateAgent.companyName} at ${corporateAgent.email} or call your corporate health coordinator.</p>
            </div>
            
            <div class="footer">
                <p><strong>eChannelling Corporate Agent Portal</strong><br>
                Powered by ${corporateAgent.companyName}<br>
                This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  // Generate text version for appointment confirmation
  private generateAppointmentConfirmationText(data: AppointmentEmailData): string {
    const {
      patientName,
      doctorName,
      specialty,
      hospital,
      date,
      time,
      appointmentId,
      amount,
      corporateAgent
    } = data;

    return `
APPOINTMENT CONFIRMED

Dear ${patientName},

Your appointment has been successfully booked.

APPOINTMENT DETAILS:
Doctor: ${doctorName}
Specialty: ${specialty}
Hospital: ${hospital}
Date: ${date}
Time: ${time}
Appointment ID: ${appointmentId}
Consultation Fee: Rs. ${amount.toLocaleString()}
Payment: Covered by ${corporateAgent.companyName}

IMPORTANT INSTRUCTIONS:
• Please arrive 15 minutes early for registration
• Bring a valid ID and this confirmation
• Contact ${corporateAgent.companyName} for any changes
• Payment is handled by your corporate agent

Need help? Contact ${corporateAgent.companyName} at ${corporateAgent.email}

---
eChannelling Corporate Agent Portal
Powered by ${corporateAgent.companyName}
    `;
  }

  // Generate HTML template for ACB confirmation (when agent confirms pending appointment)
  private generateACBConfirmationHTML(data: AppointmentEmailData): string {
    const {
      patientName,
      doctorName,
      specialty,
      hospital,
      date,
      time,
      appointmentId,
      amount,
      corporateAgent
    } = data;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Confirmed by Corporate Agent</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .appointment-card { background: #f0fdf4; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #6b7280; }
            .highlight { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .success-banner { background: #d1fae5; border: 2px solid #10b981; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✓ Appointment Confirmed!</h1>
                <p>Your appointment has been approved by your corporate agent</p>
            </div>
            
            <div class="content">
                <h2>Dear ${patientName},</h2>
                
                <div class="success-banner">
                    <h3 style="margin: 0; color: #065f46;">Great News!</h3>
                    <p style="margin: 10px 0 0 0; color: #047857;">Your appointment request has been confirmed by ${corporateAgent.companyName}. You're all set!</p>
                </div>
                
                <p>Your appointment details are confirmed. Please find the information below:</p>
                
                <div class="appointment-card">
                    <h3 style="margin-top: 0; color: #10b981;">Appointment Details</h3>
                    
                    <div class="info-row">
                        <span class="label">Doctor:</span>
                        <span class="value"><strong>${doctorName}</strong></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Specialty:</span>
                        <span class="value">${specialty}</span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Hospital:</span>
                        <span class="value">${hospital}</span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Date:</span>
                        <span class="value"><strong>${date}</strong></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Time:</span>
                        <span class="value"><strong>${time}</strong></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Appointment ID:</span>
                        <span class="value"><code>${appointmentId}</code></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Consultation Fee:</span>
                        <span class="value"><strong>Rs. ${amount.toLocaleString()}</strong></span>
                    </div>
                    
                    <div class="info-row" style="border-bottom: none;">
                        <span class="label">Payment Status:</span>
                        <span class="highlight">Covered by ${corporateAgent.companyName}</span>
                    </div>
                </div>
                
                <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #1e40af;">Important Reminders:</h4>
                    <ul style="margin: 0; color: #1e40af;">
                        <li>Please arrive <strong>15 minutes early</strong> for registration</li>
                        <li>Bring a valid <strong>ID card</strong> and this confirmation email</li>
                        <li>Payment is handled by ${corporateAgent.companyName} - no cash needed</li>
                        <li>Contact ${corporateAgent.companyName} if you need to reschedule or cancel</li>
                    </ul>
                </div>
                
                <p><strong>Need to make changes?</strong><br>
                Contact ${corporateAgent.companyName} at ${corporateAgent.email} or call your corporate health coordinator.</p>
            </div>
            
            <div class="footer">
                <p><strong>eChannelling Corporate Agent Portal</strong><br>
                Powered by ${corporateAgent.companyName}<br>
                This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  // Generate text version for ACB confirmation
  private generateACBConfirmationText(data: AppointmentEmailData): string {
    const {
      patientName,
      doctorName,
      specialty,
      hospital,
      date,
      time,
      appointmentId,
      amount,
      corporateAgent
    } = data;

    return `
APPOINTMENT CONFIRMED BY CORPORATE AGENT

Dear ${patientName},

Great news! Your appointment request has been confirmed by ${corporateAgent.companyName}.

APPOINTMENT DETAILS:
Doctor: ${doctorName}
Specialty: ${specialty}
Hospital: ${hospital}
Date: ${date}
Time: ${time}
Appointment ID: ${appointmentId}
Consultation Fee: Rs. ${amount.toLocaleString()}
Payment: Covered by ${corporateAgent.companyName}

IMPORTANT REMINDERS:
• Please arrive 15 minutes early for registration
• Bring a valid ID and this confirmation
• Payment is handled by ${corporateAgent.companyName} - no cash needed
• Contact ${corporateAgent.companyName} for any changes

Need help? Contact ${corporateAgent.companyName} at ${corporateAgent.email}

---
eChannelling Corporate Agent Portal
Powered by ${corporateAgent.companyName}
    `;
  }

  // Generate HTML template for appointment received (initial booking - pending confirmation)
  private generateAppointmentReceivedHTML(data: AppointmentEmailData): string {
    const {
      patientName,
      doctorName,
      specialty,
      hospital,
      date,
      time,
      appointmentId,
      amount,
      corporateAgent
    } = data;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Received - Confirmation Pending</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .appointment-card { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #6b7280; }
            .pending-tag { background: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .alert-box { background: #dbeafe; border: 2px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📋 Appointment Received</h1>
                <p>Your appointment request is being processed</p>
            </div>
            
            <div class="content">
                <h2>Dear ${patientName},</h2>
                
                <div class="alert-box">
                    <h3 style="margin: 0; color: #1e40af;">⏳ Confirmation Pending</h3>
                    <p style="margin: 10px 0 0 0; color: #1e3a8a;">Your appointment request has been received and is awaiting confirmation from ${corporateAgent.companyName}. You will receive another email once your appointment is confirmed.</p>
                </div>
                
                <p>We have received your appointment request with the following details:</p>
                
                <div class="appointment-card">
                    <h3 style="margin-top: 0; color: #d97706;">Appointment Details</h3>
                    
                    <div class="info-row">
                        <span class="label">Doctor:</span>
                        <span class="value"><strong>${doctorName}</strong></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Specialty:</span>
                        <span class="value">${specialty}</span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Hospital:</span>
                        <span class="value">${hospital}</span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Requested Date:</span>
                        <span class="value"><strong>${date}</strong></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Requested Time:</span>
                        <span class="value"><strong>${time}</strong></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Appointment ID:</span>
                        <span class="value"><code>${appointmentId}</code></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Consultation Fee:</span>
                        <span class="value"><strong>Rs. ${amount.toLocaleString()}</strong></span>
                    </div>
                    
                    <div class="info-row" style="border-bottom: none;">
                        <span class="label">Status:</span>
                        <span class="pending-tag">PENDING CONFIRMATION</span>
                    </div>
                </div>
                
                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #92400e;">What Happens Next?</h4>
                    <ul style="margin: 0; color: #92400e;">
                        <li><strong>${corporateAgent.companyName}</strong> will review your appointment request</li>
                        <li>You will receive a <strong>confirmation email</strong> once approved</li>
                        <li>The confirmation email will contain final appointment details</li>
                        <li>Payment will be handled by ${corporateAgent.companyName} - no cash needed</li>
                    </ul>
                </div>
                
                <p><strong>Need to make changes?</strong><br>
                Contact ${corporateAgent.companyName} at ${corporateAgent.email} or call your corporate health coordinator.</p>
            </div>
            
            <div class="footer">
                <p><strong>eChannelling Corporate Agent Portal</strong><br>
                Powered by ${corporateAgent.companyName}<br>
                This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  // Generate text version for appointment received
  private generateAppointmentReceivedText(data: AppointmentEmailData): string {
    const {
      patientName,
      doctorName,
      specialty,
      hospital,
      date,
      time,
      appointmentId,
      amount,
      corporateAgent
    } = data;

    return `
APPOINTMENT RECEIVED - CONFIRMATION PENDING

Dear ${patientName},

Your appointment request has been received and is awaiting confirmation from ${corporateAgent.companyName}.

APPOINTMENT DETAILS:
Doctor: ${doctorName}
Specialty: ${specialty}
Hospital: ${hospital}
Requested Date: ${date}
Requested Time: ${time}
Appointment ID: ${appointmentId}
Consultation Fee: Rs. ${amount.toLocaleString()}
Status: PENDING CONFIRMATION

WHAT HAPPENS NEXT:
• ${corporateAgent.companyName} will review your appointment request
• You will receive a confirmation email once approved
• Payment will be handled by ${corporateAgent.companyName}
• Keep this email for your records

Need to make changes? Contact ${corporateAgent.companyName} at ${corporateAgent.email}

---
eChannelling Corporate Agent Portal
Powered by ${corporateAgent.companyName}
    `;
  }

  // Generate corporate notification HTML
  private generateCorporateNotificationHTML(data: AppointmentEmailData): string {
    const {
      patientName,
      patientEmail,
      patientPhone,
      doctorName,
      specialty,
      hospital,
      date,
      time,
      appointmentId,
      amount
    } = data;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .booking-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>New Appointment Booking</h2>
        </div>
        <div class="content">
            <p>A new appointment has been booked through your corporate agent portal.</p>
            
            <div class="booking-card">
                <h3>Patient: ${patientName}</h3>
                <p><strong>Email:</strong> ${patientEmail}</p>
                <p><strong>Phone:</strong> ${patientPhone}</p>
                <p><strong>Doctor:</strong> ${doctorName} (${specialty})</p>
                <p><strong>Hospital:</strong> ${hospital}</p>
                <p><strong>Date & Time:</strong> ${date} at ${time}</p>
                <p><strong>Appointment ID:</strong> ${appointmentId}</p>
                <p><strong>Amount:</strong> Rs. ${amount.toLocaleString()}</p>
            </div>
            
            <p>Patient notification sent successfully</p>
            <p>Corporate billing processed</p>
        </div>
    </body>
    </html>`;
  }

  // Send appointment cancellation email
  async sendAppointmentCancellation(appointmentData: AppointmentEmailData & { cancelReason?: string }): Promise<EmailResult> {
    try {
      const {
        patientName,
        patientEmail,
        doctorName,
        specialty,
        hospital,
        date,
        time,
        appointmentId,
        amount,
        corporateAgent,
        cancelReason
      } = appointmentData;

      const mailOptions = {
        from: `"eChannelling Corporate Agent" <${process.env.SMTP_USER}>`,
        to: patientEmail,
        subject: `Appointment Cancellation - Dr. ${doctorName}`,
        html: this.generateAppointmentCancellationHTML(appointmentData),
        text: this.generateAppointmentCancellationText(appointmentData)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('[SUCCESS] Appointment cancellation email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('[ERROR] Cancellation email sending failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Send corporate cancellation notification
  async sendCorporateCancellationNotification(appointmentData: AppointmentEmailData & { cancelReason?: string }): Promise<EmailResult> {
    try {
      const { corporateAgent, patientName, doctorName, date, time, cancelReason } = appointmentData;

      const mailOptions = {
        from: `"eChannelling System" <${process.env.SMTP_USER}>`,
        to: corporateAgent.email,
        subject: `Appointment Cancellation - ${patientName}`,
        html: this.generateCorporateCancellationNotificationHTML(appointmentData),
        text: `Appointment cancelled for ${patientName} with ${doctorName} on ${date} at ${time}. Reason: ${cancelReason || 'Not specified'}`
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('[SUCCESS] Corporate cancellation notification sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('[ERROR] Corporate cancellation notification failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Generate HTML template for appointment cancellation
  private generateAppointmentCancellationHTML(data: AppointmentEmailData & { cancelReason?: string }): string {
    const {
      patientName,
      doctorName,
      specialty,
      hospital,
      date,
      time,
      appointmentId,
      amount,
      corporateAgent,
      cancelReason
    } = data;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Cancellation</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .appointment-card { background: #fef2f2; border: 1px solid #dc2626; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #6b7280; }
            .cancelled-tag { background: #dc2626; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .btn { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Appointment Cancelled</h1>
                <p>Your appointment has been cancelled</p>
            </div>
            
            <div class="content">
                <h2>Dear ${patientName},</h2>
                <p>We regret to inform you that your appointment has been cancelled. Please find the details below:</p>
                
                <div class="appointment-card">
                    <h3 style="margin-top: 0; color: #dc2626;">Appointment Details</h3>
                    
                    <div class="info-row">
                        <span class="label">Doctor:</span>
                        <span class="value"><strong>${doctorName}</strong></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Specialty:</span>
                        <span class="value">${specialty}</span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Hospital:</span>
                        <span class="value">${hospital}</span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Date:</span>
                        <span class="value"><strong>${date}</strong></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Time:</span>
                        <span class="value"><strong>${time}</strong></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Appointment ID:</span>
                        <span class="value"><code>${appointmentId}</code></span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Status:</span>
                        <span class="cancelled-tag">CANCELLED</span>
                    </div>
                    
                    ${cancelReason ? `
                    <div class="info-row" style="border-bottom: none;">
                        <span class="label">Cancellation Reason:</span>
                        <span class="value"><em>${cancelReason}</em></span>
                    </div>
                    ` : ''}
                </div>
                
                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <h4 style="margin-top: 0; color: #92400e;">Next Steps:</h4>
                    <ul style="margin: 0; color: #92400e;">
                        <li>No payment will be charged for this cancelled appointment</li>
                        <li>You can book a new appointment through your corporate agent portal</li>
                        <li>Contact ${corporateAgent.companyName} if you need assistance</li>
                        <li>If this cancellation was made in error, please contact us immediately</li>
                    </ul>
                </div>
                
                <p><strong>Need to book a new appointment?</strong><br>
                Contact ${corporateAgent.companyName} at ${corporateAgent.email} or visit the corporate portal.</p>
            </div>
            
            <div class="footer">
                <p><strong>eChannelling Corporate Agent Portal</strong><br>
                Powered by ${corporateAgent.companyName}<br>
                This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  // Generate text version for appointment cancellation
  private generateAppointmentCancellationText(data: AppointmentEmailData & { cancelReason?: string }): string {
    const {
      patientName,
      doctorName,
      specialty,
      hospital,
      date,
      time,
      appointmentId,
      amount,
      corporateAgent,
      cancelReason
    } = data;

    return `
APPOINTMENT CANCELLED

Dear ${patientName},

We regret to inform you that your appointment has been cancelled.

APPOINTMENT DETAILS:
Doctor: ${doctorName}
Specialty: ${specialty}
Hospital: ${hospital}
Date: ${date}
Time: ${time}
Appointment ID: ${appointmentId}
Status: CANCELLED
${cancelReason ? `Cancellation Reason: ${cancelReason}` : ''}

NEXT STEPS:
• No payment will be charged for this cancelled appointment
• You can book a new appointment through your corporate agent portal
• Contact ${corporateAgent.companyName} for assistance
• If this was made in error, contact us immediately

Need help? Contact ${corporateAgent.companyName} at ${corporateAgent.email}

---
eChannelling Corporate Agent Portal
Powered by ${corporateAgent.companyName}
    `;
  }

  // Generate corporate cancellation notification HTML
  private generateCorporateCancellationNotificationHTML(data: AppointmentEmailData & { cancelReason?: string }): string {
    const {
      patientName,
      patientEmail,
      patientPhone,
      doctorName,
      specialty,
      hospital,
      date,
      time,
      appointmentId,
      amount,
      cancelReason
    } = data;

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .cancellation-card { background: #fef2f2; border: 1px solid #dc2626; padding: 15px; border-radius: 8px; margin: 15px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Appointment Cancellation</h2>
        </div>
        <div class="content">
            <p>An appointment has been cancelled through your corporate agent portal.</p>
            
            <div class="cancellation-card">
                <h3>Patient: ${patientName}</h3>
                <p><strong>Email:</strong> ${patientEmail}</p>
                <p><strong>Phone:</strong> ${patientPhone}</p>
                <p><strong>Doctor:</strong> ${doctorName} (${specialty})</p>
                <p><strong>Hospital:</strong> ${hospital}</p>
                <p><strong>Date & Time:</strong> ${date} at ${time}</p>
                <p><strong>Appointment ID:</strong> ${appointmentId}</p>
                <p><strong>Amount:</strong> Rs. ${amount.toLocaleString()}</p>
                <p><strong>Status:</strong> CANCELLED</p>
                ${cancelReason ? `<p><strong>Reason:</strong> ${cancelReason}</p>` : ''}
            </div>
            
            <p>Patient cancellation notification sent</p>
            <p>No charges applied for cancelled appointment</p>
        </div>
    </body>
    </html>`;
  }

  // Test email configuration
  async testConnection(): Promise<EmailResult> {
    try {
      await this.transporter.verify();
      console.log('[SUCCESS] SMTP server is ready to take our messages');
      return { success: true };
    } catch (error) {
      console.error('[ERROR] SMTP connection failed:', error);
      return { success: false, error: (error as Error).message };
    }
  }
}

export const emailService = new EmailService();
export { EmailService, AppointmentEmailData, EmailResult };