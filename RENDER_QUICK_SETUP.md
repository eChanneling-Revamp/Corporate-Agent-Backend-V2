# Quick Render Setup - Step by Step

## 🚨 PROBLEM: Emails not working on production
## ✅ SOLUTION: Add environment variables to Render

---

## Step-by-Step Guide (5 minutes)

### Step 1: Go to Render Dashboard
1. Open: https://dashboard.render.com
2. Log in with your account
3. Click on your service: **"Corporate-Agent-Backend-V2"** (or similar name)

### Step 2: Open Environment Tab
1. On the left sidebar, click **"Environment"**
2. You'll see a list of environment variables

### Step 3: Add Each Variable (Click "Add Environment Variable" button)

Copy-paste these EXACTLY as shown (including spaces in SMTP_PASS):

```
Key: DATABASE_URL
Value: postgresql://neondb_owner:npg_Oc3jv9SIHGnf@ep-blue-pine-a84ccjv8-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require
```

```
Key: JWT_ACCESS_SECRET
Value: corporate-agent-neon-jwt-access-secret-2024-production-ready-key-v1
```

```
Key: JWT_REFRESH_SECRET
Value: corporate-agent-neon-jwt-refresh-secret-2024-production-ready-key-v1
```

```
Key: JWT_ACCESS_EXPIRY
Value: 15m
```

```
Key: JWT_REFRESH_EXPIRY
Value: 7d
```

```
Key: BCRYPT_SALT_ROUNDS
Value: 12
```

```
Key: FRONTEND_URL
Value: https://corporate-agent-frontend-v2.vercel.app
```

```
Key: ALLOWED_ORIGINS
Value: https://corporate-agent-frontend-v2.vercel.app,https://corporate-agent-frontend-v2-git-main-echanneling-revamp.vercel.app,https://corporate-agent-frontend-v2-git-feat-prod-echanneling-revamp.vercel.app
```

### 🔴 MOST IMPORTANT - Email Configuration:

```
Key: SMTP_HOST
Value: smtp.gmail.com
```

```
Key: SMTP_PORT
Value: 587
```

```
Key: SMTP_USER
Value: echanneling.revamp@gmail.com
```

```
Key: SMTP_PASS
Value: dkcs xlxl esjq ayuy
⚠️ IMPORTANT: This has spaces - copy exactly as shown!
```

```
Key: EMAIL_FROM
Value: echanneling.revamp@gmail.com
```

### Step 4: Save Changes
1. Click **"Save Changes"** button at the bottom
2. Render will automatically redeploy your service
3. Wait 2-3 minutes for deployment to complete

### Step 5: Verify It's Working
1. Click on **"Logs"** tab in Render
2. Look for these messages:
   ```
   SMTP Configuration Check: { user: 'configured', pass: 'configured' }
   ```
3. If you see `user: 'configured'` and `pass: 'configured'` = ✅ SUCCESS!
4. If you see `user: 'missing'` or `pass: 'missing'` = ❌ Go back to Step 3

### Step 6: Test Emails
1. Go to your frontend: https://corporate-agent-frontend-v2.vercel.app
2. Create a new appointment
3. Check Render logs - you should see:
   ```
   Appointment received email sent successfully to: user@example.com
   Email message ID: <xxxxx@gmail.com>
   ```
4. Check your email inbox - you should receive the appointment email! 📧

---

## Troubleshooting

### Issue: Still seeing "Email service not configured"
**Fix:** Environment variables not saved. Go back to Step 3 and re-add them.

### Issue: "Authentication failed" error
**Fix:** Check SMTP_PASS - it should be: `dkcs xlxl esjq ayuy` (with spaces, no quotes)

### Issue: Variables disappear after saving
**Fix:** Make sure you're clicking "Save Changes" after adding all variables.

---

## Quick Checklist

- [ ] Added DATABASE_URL
- [ ] Added JWT_ACCESS_SECRET
- [ ] Added JWT_REFRESH_SECRET
- [ ] Added JWT_ACCESS_EXPIRY
- [ ] Added JWT_REFRESH_EXPIRY
- [ ] Added BCRYPT_SALT_ROUNDS
- [ ] Added FRONTEND_URL
- [ ] Added ALLOWED_ORIGINS
- [ ] Added SMTP_HOST = smtp.gmail.com
- [ ] Added SMTP_PORT = 587
- [ ] Added SMTP_USER = echanneling.revamp@gmail.com
- [ ] Added SMTP_PASS = dkcs xlxl esjq ayuy (with spaces!)
- [ ] Added EMAIL_FROM = echanneling.revamp@gmail.com
- [ ] Clicked "Save Changes"
- [ ] Waited for redeploy to complete
- [ ] Checked logs for "configured" message
- [ ] Tested creating an appointment
- [ ] Received email successfully

---

## Need Help?

Check Render logs for error messages:
1. Render Dashboard → Your Service → Logs tab
2. Look for lines starting with "ERROR:" or "WARNING:"
3. Search for "SMTP Configuration Check" to verify email setup

Done! Your emails should now work on production! 🎉
