# Render Deployment Setup Guide

## Required Environment Variables for Render

To enable email notifications on your Render deployment, you MUST set these environment variables:

### 1. Go to your Render Dashboard
- Navigate to: https://dashboard.render.com
- Select your `Corporate-Agent-Backend-V2` service
- Go to "Environment" tab

### 2. Add the following Environment Variables:

**IMPORTANT:** Copy these EXACT values into Render Dashboard. Do not change anything!

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_Oc3jv9SIHGnf@ep-blue-pine-a84ccjv8-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `JWT_ACCESS_SECRET` | `corporate-agent-neon-jwt-access-secret-2024-production-ready-key-v1` |
| `JWT_REFRESH_SECRET` | `corporate-agent-neon-jwt-refresh-secret-2024-production-ready-key-v1` |
| `JWT_ACCESS_EXPIRY` | `15m` |
| `JWT_REFRESH_EXPIRY` | `7d` |
| `BCRYPT_SALT_ROUNDS` | `12` |
| `FRONTEND_URL` | `https://corporate-agent-frontend-v2.vercel.app` |
| `ALLOWED_ORIGINS` | `https://corporate-agent-frontend-v2.vercel.app,https://corporate-agent-frontend-v2-git-main-echanneling-revamp.vercel.app,https://corporate-agent-frontend-v2-git-feat-prod-echanneling-revamp.vercel.app` |
| **🔴 CRITICAL FOR EMAIL** | |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `echanneling.revamp@gmail.com` |
| `SMTP_PASS` | `dkcs xlxl esjq ayuy` |
| `EMAIL_FROM` | `echanneling.revamp@gmail.com` |

**Note:** The SMTP_PASS value has spaces - this is correct! Copy it exactly as shown: `dkcs xlxl esjq ayuy`

### 3. Save and Redeploy
- Click "Save Changes"
- Render will automatically redeploy your service
- Wait for deployment to complete (check logs)

### 4. Verify Email Configuration
After deployment, check the Render logs for:
```
SMTP Configuration Check: {
  host: 'smtp.gmail.com',
  port: 587,
  user: 'configured',
  pass: 'configured'
}
```

If you see `user: 'missing'` or `pass: 'missing'`, the environment variables are not set correctly.

## Testing Email Functionality

1. Create a test appointment through the frontend
2. Check Render logs for: `"Appointment received email sent successfully"`
3. Confirm an appointment and check for: `"ACB confirmation email sent"`
4. Cancel an appointment and check for: `"ACB cancellation emails sent"`

## Common Issues

### Issue: "Email service not configured"
**Solution:** Environment variables not set on Render. Follow steps above.

### Issue: "Authentication failed" in logs
**Solution:** SMTP_PASS might have spaces. Use the exact value: `dkcs xlxl esjq ayuy`

### Issue: Confirmed appointments still showing in Confirm ACB page
**Solution:** This is correct behavior if you're looking at old data. The `/api/appointments/unpaid` endpoint only returns PENDING appointments. Try:
1. Create a NEW appointment
2. It should appear in Confirm ACB page
3. Confirm it
4. It should disappear from Confirm ACB page
5. Check Appointments page to see it as "confirmed"

## Environment Variables Checklist

- [ ] DATABASE_URL is set
- [ ] JWT secrets are set
- [ ] SMTP_HOST = smtp.gmail.com
- [ ] SMTP_PORT = 587
- [ ] SMTP_USER = echanneling.revamp@gmail.com
- [ ] SMTP_PASS = dkcs xlxl esjq ayuy (with spaces)
- [ ] EMAIL_FROM = echanneling.revamp@gmail.com
- [ ] ALLOWED_ORIGINS includes all Vercel URLs
- [ ] NODE_ENV = production

## Checking Logs

To view logs and verify email sending:
1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. Look for email-related messages

Successful email logs will show:
```
Sending appointment received email to: user@example.com
SMTP Configuration Check: { ... user: 'configured', pass: 'configured' }
Appointment received email sent successfully to: user@example.com
Email message ID: <xxxxx@gmail.com>
```

## Support

If emails still don't work after setting environment variables:
1. Check Render logs for specific error messages
2. Verify Gmail app password is correct
3. Ensure Gmail account has "Less secure app access" or "App passwords" enabled
