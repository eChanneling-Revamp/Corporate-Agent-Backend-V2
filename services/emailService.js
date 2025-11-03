const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

class EmailService {
  constructor() {
    // Initialize transporter with SMTP configuration
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER, // Your email
        pass: process.env.SMTP_PASS, // Your app password
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Send appointment confirmation email
  async sendAppointmentConfirmation(appointmentData) {
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
        subject: `Appointment Confirmed - ${doctorName}`,
        html: this.generateAppointmentConfirmationHTML(appointmentData),
        text: this.generateAppointmentConfirmationText(appointmentData)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Appointment confirmation email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Send notification to corporate agent
  async sendCorporateNotification(appointmentData) {
    try {
      const { corporateAgent, patientName, doctorName, date, time } = appointmentData;

      const mailOptions = {
        from: `"eChannelling System" <${process.env.SMTP_USER}>`,
        to: corporateAgent.email,
        subject: `New Appointment Booked - ${patientName}`,
        html: this.generateCorporateNotificationHTML(appointmentData),
        text: `New appointment booked for ${patientName} with ${doctorName} on ${date} at ${time}`
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Corporate notification sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Corporate notification failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate HTML template for appointment confirmation
  generateAppointmentConfirmationHTML(data) {
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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #111827; line-height: 1.6; background: #f7fafc; padding: 20px; margin: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 6px 18px rgba(15,23,42,0.08); }
            .header { background: linear-gradient(90deg, #0ea5a3, #3b82f6); color: #fff; padding: 28px 24px; text-align: center; }
            .content { padding: 24px; }
            .appointment-card { border: 1px solid #e6edf3; border-radius: 6px; padding: 16px; background: #fbfeff; margin-bottom: 18px; }
            .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eef3f7; }
            .label { color: #374151; font-weight: 600; }
            .value { color: #111827; }
            .highlight { background: #10b981; color: white; padding: 4px 12px; border-radius: 4px; font-size: 14px; }
            .footer { background: #f9fafb; padding: 14px 24px; text-align: center; color: #6b7280; font-size: 13px; }
            .instructions { margin-bottom: 18px; }
            .instructions h3 { margin: 0 0 8px; font-size: 15px; color: #0f172a; }
            .instructions ul { margin: 0 0 0 18px; color: #374151; }
            .contact-info { margin-bottom: 18px; }
            .contact-info p { margin: 0; }
            .contact-info p:first-child { margin-bottom: 6px; }
            code { background: #ffffff; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin: 0; font-size: 20px; font-weight: 600;">Appointment Confirmed</h1>
                <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.95;">Your appointment has been successfully booked.</p>
            </div>
            
            <div class="content">
                <p style="margin: 0 0 12px;">Dear <strong>${patientName}</strong>,</p>
                <p style="margin: 0 0 18px;">Thank you. Your appointment has been confirmed. Below are the appointment details:</p>
                
                <div class="appointment-card">
                    <div class="info-row">
                        <span class="label">Doctor</span>
                        <span class="value">${doctorName}</span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Specialty</span>
                        <span class="value">${specialty}</span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Hospital</span>
                        <span class="value">${hospital}</span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Date</span>
                        <span class="value">${date}</span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Time</span>
                        <span class="value">${time}</span>
                    </div>
                    
                    <div class="info-row">
                        <span class="label">Appointment ID</span>
                        <span class="value"><code>${appointmentId}</code></span>
                    </div>
                    
                    <div class="info-row" style="border-bottom: none;">
                        <span class="label">Consultation Fee</span>
                        <span class="value">Rs. ${amount.toLocaleString()}</span>
                    </div>
                </div>
                
                <div class="instructions">
                    <h3>Important Instructions</h3>
                    <ul>
                        <li>Please arrive 15 minutes early for registration.</li>
                        <li>Bring a valid photo ID and this appointment confirmation.</li>
                        <li>If you need to reschedule or cancel, contact your corporate health coordinator at least 24 hours in advance.</li>
                        <li>Payment for this consultation is handled by ${corporateAgent.companyName}; no payment is required at the hospital.</li>
                    </ul>
                </div>
                
                <div class="contact-info">
                    <p>If you have any questions, please contact:</p>
                    <p><strong>${corporateAgent.companyName}</strong><br>
                    Email: <a href="mailto:${corporateAgent.email}" style="color: #0ea5a3; text-decoration: none;">${corporateAgent.email}</a><br>
                    Phone: <a href="tel:+94112691111" style="color: #0ea5a3; text-decoration: none;">+94 11 269 1111</a></p>
                </div>
                
                <p style="margin: 0; color: #6b7280; font-size: 13px;">This is an automated message. Please do not reply to this email.</p>
            </div>
            
            <div class="footer">
                <div style="font-weight: 600; color: #111827;">eChannelling Corporate Agent Portal</div>
                <div>Powered by ${corporateAgent.companyName}</div>
            </div>
        </div>
    </body>
    </html>`;
  }

  // Generate text version for appointment confirmation
  generateAppointmentConfirmationText(data) {
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

Your appointment has been confirmed. Below are the details:

APPOINTMENT DETAILS:
- Doctor: ${doctorName}
- Specialty: ${specialty}
- Hospital: ${hospital}
- Date: ${date}
- Time: ${time}
- Appointment ID: ${appointmentId}
- Consultation Fee: Rs. ${amount.toLocaleString()}
- Payment: Covered by ${corporateAgent.companyName}

IMPORTANT INSTRUCTIONS:
- Please arrive 15 minutes early for registration.
- Bring a valid photo ID and this confirmation.
- If you need to reschedule or cancel, contact your corporate health coordinator at least 24 hours in advance.
- Payment is handled by your corporate agent; no payment is required at the hospital.

CONTACT:
${corporateAgent.companyName}
Email: ${corporateAgent.email}
Phone: +94 11 269 1111

This is an automated message. Please do not reply to this email.

---
eChannelling Corporate Agent Portal
Powered by ${corporateAgent.companyName}
    `;
  }

  // Generate corporate notification HTML
  generateCorporateNotificationHTML(data) {
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
            <h2>New Appointment Booked</h2>
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

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('[SUCCESS] SMTP server is ready to take our messages');
      return { success: true, message: 'SMTP connection verified' };
    } catch (error) {
      console.error('[ERROR] SMTP connection failed:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();