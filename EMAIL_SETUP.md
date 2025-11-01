# Email Configuration Setup Guide

This guide will help you configure SMTP email notifications for the Corporate Agent Module.

## Quick Setup Instructions

### 1. Gmail Configuration (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Copy the generated 16-character password

3. **Update .env file:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

### 2. Outlook/Hotmail Configuration

1. **Update .env file:**
   ```env
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_USER=your-email@outlook.com
   SMTP_PASS=your-account-password
   ```

### 3. Yahoo Mail Configuration

1. **Update .env file:**
   ```env
   SMTP_HOST=smtp.mail.yahoo.com
   SMTP_PORT=587
   SMTP_USER=your-email@yahoo.com
   SMTP_PASS=your-app-password
   ```

## Testing Email Configuration

### 1. Test SMTP Connection
```bash
curl http://localhost:3001/api/test/email
```

Expected response:
```json
{
  "success": true,
  "message": "Email service is configured and ready"
}
```

### 2. Send Test Email
```bash
curl -X POST http://localhost:3001/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'
```

## Email Features

### ✅ Patient Notifications
- **Appointment Confirmation:** Professional HTML email with all appointment details
- **Company Branding:** Corporate agent company information included
- **Instructions:** Clear guidance for appointment day
- **Contact Information:** Easy access to support contacts

### ✅ Corporate Agent Notifications
- **Booking Alerts:** Instant notification when patients book appointments
- **Patient Details:** Complete patient and appointment information
- **Revenue Tracking:** Appointment amounts for billing purposes

### ✅ Email Templates
- **Professional Design:** Modern, responsive HTML templates
- **Branding:** Corporate colors and logos
- **Mobile Friendly:** Optimized for all devices
- **Fallback Text:** Plain text version for compatibility

## Email Content Examples

### Patient Confirmation Email
```
Subject: ✅ Appointment Confirmed - Dr. Smith Williams

🎉 Appointment Confirmed!
Your appointment has been successfully booked

👨‍⚕️ Doctor: Dr. Smith Williams
🏥 Specialty: Cardiology  
🏢 Hospital: Nawaloka Hospital
📅 Date: November 2, 2024
🕐 Time: 2:00 PM
💰 Fee: Rs. 3,500 (Covered by ABC Insurance)
```

### Corporate Agent Notification
```
Subject: 📋 New Appointment Booked - John Doe

New appointment booked through your corporate portal:
- Patient: John Doe (john@example.com)
- Doctor: Dr. Smith Williams (Cardiology)
- Date: November 2, 2024 at 2:00 PM
- Amount: Rs. 3,500
```

## Troubleshooting

### Common Issues

1. **"Authentication Failed" Error**
   - Check email and password in .env file
   - For Gmail: Ensure you're using App Password, not account password
   - Verify 2-Factor Authentication is enabled

2. **"Connection Timeout" Error**
   - Check SMTP_HOST and SMTP_PORT settings
   - Verify internet connection and firewall settings

3. **Emails Not Received**
   - Check spam/junk folders
   - Verify recipient email address
   - Test with different email providers

### Debug Mode

Add to .env for detailed logging:
```env
NODE_ENV=development
LOG_LEVEL=debug
```

## Production Recommendations

### Security
- Use environment-specific .env files
- Never commit .env files to version control
- Use app passwords instead of account passwords
- Implement rate limiting for email endpoints

### Reliability  
- Add email queue system for high volume
- Implement retry logic for failed emails
- Set up monitoring and alerting
- Use dedicated SMTP service (SendGrid, AWS SES, etc.)

### Performance
- Batch email sending for bulk operations
- Use background processing for email delivery
- Cache email templates
- Implement email delivery status tracking

## Advanced Configuration

### Custom SMTP Provider
```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_SECURE=false
```

### Email Customization
- Edit `backend/services/emailService.js`
- Modify HTML templates in `generateAppointmentConfirmationHTML()`
- Update email subjects and content
- Add company logos and branding

## Support

If you encounter issues:
1. Check the server logs for detailed error messages
2. Test SMTP connection using the test endpoint
3. Verify .env configuration matches your email provider
4. Ensure all required packages are installed: `npm install`

---

**Email Service Status:** ✅ Ready for Production
**Last Updated:** November 1, 2024
**Version:** 1.0.0