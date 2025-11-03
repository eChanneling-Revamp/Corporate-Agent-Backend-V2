// Quick Email Service Test
const nodemailer = require('nodemailer');

// Test SMTP configuration
async function testEmailSetup() {
  console.log('[TEST] Testing Email Service Configuration...\n');
  
  // Check if credentials are configured
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST;
  
  console.log('[SMTP] SMTP Configuration:');
  console.log(`   Host: ${smtpHost}`);
  console.log(`   User: ${smtpUser ? `${smtpUser.substring(0, 3)}***${smtpUser.substring(smtpUser.length - 10)}` : 'Not configured'}`);
  console.log(`   Password: ${smtpPass ? '***configured***' : 'Not configured'}\n`);
  
  if (!smtpUser || !smtpPass || smtpUser === 'your-email@gmail.com') {
    console.log('[WARNING] SMTP credentials not configured in .env file');
    console.log('[CONFIG] Please update your .env file with real SMTP credentials:\n');
    console.log('   SMTP_USER=your-actual-email@gmail.com');
    console.log('   SMTP_PASS=your-16-character-app-password\n');
    console.log('[DOCS] See EMAIL_SETUP.md for detailed instructions');
    return;
  }
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    
    // Test connection
    console.log('[CONNECT] Testing SMTP connection...');
    await transporter.verify();
    console.log('[SUCCESS] SMTP connection successful!');
    console.log('[EMAIL] Email service is ready to send notifications\n');
    
    // Show what happens when appointments are booked
    console.log('[INFO] When appointments are booked, patients will receive:');
    console.log('   [EMAIL] Professional appointment confirmation email');
    console.log('   [DETAILS] All appointment details (doctor, time, hospital)');
    console.log('   [COMPANY] Corporate agent company information');
    console.log('   [CONTACT] Contact information for support\n');
    
    console.log('[AGENT] Corporate agents will receive:');
    console.log('   [NOTIFY] Instant booking notification');
    console.log('   [PATIENT] Patient contact information');
    console.log('   [BILLING] Billing amount for processing\n');
    
  } catch (error) {
    console.log('[ERROR] SMTP connection failed:', error.message);
    console.log('\n[HELP] Common solutions:');
    console.log('   1. Check email and password in .env file');
    console.log('   2. For Gmail: Use App Password (not account password)');
    console.log('   3. Ensure 2-Factor Authentication is enabled');
    console.log('   4. Check firewall/antivirus blocking SMTP');
  }
}

// Load environment variables
require('dotenv').config();

// Send actual test email
async function sendTestEmail() {
  console.log('\n[EMAIL] Sending Test Appointment Email...');
  
  try {
    const emailService = require('./services/emailService');
    
    const testAppointmentData = {
      patientName: 'John Doe (Test Patient)',
      patientEmail: 'echanneling.revamp@gmail.com',
      patientPhone: '+94771234567',
      doctorName: 'Dr. Sarah Williams',
      specialty: 'Cardiology',
      hospital: 'Nawaloka Hospital',
      date: 'November 2, 2024',
      time: '2:00 PM',
      appointmentId: 'TEST-APPOINTMENT-' + Date.now(),
      amount: 3500,
      corporateAgent: {
        companyName: 'ABC Insurance Company',
        email: 'corporateagent@slt.lk'
      }
    };

    const emailResult = await emailService.sendAppointmentConfirmation(testAppointmentData);
    
    if (emailResult.success) {
      console.log('[SUCCESS] Test Email Sent Successfully!');
      console.log('[EMAIL] Message ID:', emailResult.messageId);
      console.log('[INBOX] Check your Gmail inbox: echanneling.revamp@gmail.com');
      console.log('[SPAM] Check spam folder if not in inbox');
      console.log('\n[INFO] This is exactly what patients will receive when they book appointments!');
    } else {
      console.log('[ERROR] Test Email Failed:', emailResult.error);
    }
    
  } catch (error) {
    console.error('[ERROR] Email sending failed:', error.message);
  }
}

// Run tests
testEmailSetup()
  .then(() => sendTestEmail())
  .catch(console.error);