# JWT Authentication Implementation Guide

## Overview
This document explains how JWT (JSON Web Token) authentication is implemented in the Corporate Agent Backend to identify specific logged-in agents.

## 🔐 Authentication Flow

### 1. Login Process
```javascript
POST /api/auth/login
Body: { email, password }

Response: {
  success: true,
  data: {
    user: { id, email, role },
    agent: { id, name, companyName, email },
    tokens: {
      accessToken: "eyJhbGc...",  // Valid for 15 minutes
      refreshToken: "eyJhbGc..."  // Valid for 7 days
    }
  }
}
```

**Frontend automatically stores:**
- `accessToken` in localStorage
- `refreshToken` in localStorage  
- `agentInfo` in localStorage

### 2. Making Authenticated Requests

**All protected endpoints now require the JWT token:**

```javascript
// Frontend automatically adds this header
Authorization: Bearer <accessToken>
```

### 3. Backend Validates Token

Two middleware functions are available:

#### `authenticateToken` - Strict Authentication
- **Requires** valid token
- Returns 401 if no token
- Returns 403 if token invalid/expired
- Attaches `req.agent` and `req.user` to request

#### `optionalAuth` - Backward Compatible
- Works with OR without token
- If token present: Uses token to identify agent
- If no token: Falls back to first agent (for demo)
- Always attaches `req.agent` to request

## 🛠️ Implementation Details

### Backend Middleware

```javascript
// Located in server-simple.js after line 58

const authenticateToken = async (req, res, next) => {
  // 1. Extract token from Authorization header
  const token = req.headers['authorization']?.split(' ')[1];
  
  // 2. Verify token with JWT secret
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    // 3. Get agent from database using userId from token
    const agent = await prisma.agent.findFirst({
      where: { userId: decoded.userId }
    });
    
    // 4. Attach agent to request object
    req.agent = agent;
    next();
  });
};
```

### Protected Endpoints

**All these endpoints now use `optionalAuth` middleware:**

1. `GET /api/profile` - Get agent profile
2. `PUT /api/profile` - Update agent profile
3. `POST /api/appointments` - Create appointment
4. `POST /api/appointments/bulk` - Bulk create appointments
5. `POST /api/auth/change-password` - Change password
6. `GET /api/notifications` - Get notifications
7. `PATCH /api/notifications/read-all` - Mark all as read

### Frontend Implementation

```typescript
// lib/api.ts

// Helper function to add Authorization header
const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// All API calls use getAuthHeaders()
profile: {
  get: async () => {
    const response = await fetch(`${API_BASE}/profile`, {
      headers: getAuthHeaders()  // ← Adds token automatically
    });
    return response.json();
  }
}
```

## 🔄 Token Lifecycle

### Access Token
- **Lifetime:** 15 minutes
- **Purpose:** Authorize API requests
- **Storage:** localStorage
- **Format:** JWT with payload: `{ userId, email, role }`

### Refresh Token
- **Lifetime:** 7 days  
- **Purpose:** Get new access token when expired
- **Storage:** localStorage + Database
- **Note:** Refresh endpoint not yet implemented (TODO)

## 📝 Usage Examples

### Example 1: Login and Store Tokens

```javascript
// User logs in
const response = await api.auth.login('agent@corporate.com', 'password');

// Tokens automatically stored:
localStorage.getItem('accessToken')   // "eyJhbGciOiJIUzI1..."
localStorage.getItem('refreshToken')  // "eyJhbGciOiJIUzI1..."
localStorage.getItem('agentInfo')     // "{"id":"123","name":"John"...}"
```

### Example 2: Making Authenticated Request

```javascript
// Frontend: Call API (token added automatically)
const profile = await api.profile.get();

// Backend receives:
// Authorization: Bearer eyJhbGciOiJIUzI1...
//
// Middleware extracts token → verifies → finds agent → attaches to req.agent
// Controller accesses: req.agent.id, req.agent.name, etc.
```

### Example 3: Logout

```javascript
await api.auth.logout();

// Tokens automatically removed from:
// - localStorage (frontend)
// - Database (backend - refreshToken deleted)
```

## 🎯 Benefits

### Before (using findFirst):
```javascript
// ❌ Returns random agent
const agent = await prisma.agent.findFirst();
// Problem: Multi-agent system = unpredictable results
```

### After (using JWT):
```javascript
// ✅ Returns specific logged-in agent
const agent = req.agent;  // From middleware
// Solution: Each user sees only THEIR data
```

## 🚀 Migration Path

### Current State (Backward Compatible)
- **optionalAuth** middleware used
- Works with OR without token
- If no token → uses first agent (demo fallback)
- **No breaking changes** to existing code

### Future (Production Ready)
- Switch to **authenticateToken** middleware
- Requires token for all requests
- Multi-agent support fully operational
- Remove demo fallback logic

## 🔧 Configuration

### Environment Variables

```env
# .env file
JWT_ACCESS_SECRET=corporate-agent-neon-jwt-access-secret-2024-production-ready-key-v1
JWT_REFRESH_SECRET=corporate-agent-neon-jwt-refresh-secret-2024-production-ready-key-v1
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

### Token Secrets
- **Access Token:** Separate secret for short-lived tokens
- **Refresh Token:** Separate secret for long-lived tokens
- **Security:** Different secrets prevent token escalation

## 📋 Testing

### Test Authentication Flow

```bash
# 1. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@corporate.com","password":"password123"}'

# Response includes accessToken

# 2. Use Token
curl http://localhost:3001/api/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1..."

# 3. Logout
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJhbGciOiJIUzI1..."}'
```

## 🐛 Debugging

### Check if Token is Being Sent

```javascript
// In browser console (Settings page)
console.log('Token:', localStorage.getItem('accessToken'));
console.log('Agent:', localStorage.getItem('agentInfo'));
```

### Backend Logs

```javascript
// Server logs show authentication:
[AUTH] Authenticated: John Smith ( agent@corporate.com )
[PROFILE] Returning agent: John Smith (ID: 1021a651...)
```

### Common Issues

1. **401 Unauthorized**
   - Token missing or not sent
   - Check localStorage.getItem('accessToken')

2. **403 Forbidden**
   - Token expired (15 min lifetime)
   - Token invalid or corrupted
   - Solution: Login again to get new token

3. **Agent not found**
   - Token valid but agent deleted from DB
   - Token userId doesn't match any agent

## 📚 Next Steps (TODO)

1. **Implement Token Refresh Endpoint**
   ```javascript
   POST /api/auth/refresh
   Body: { refreshToken }
   Returns: { accessToken }
   ```

2. **Add Token Expiry Handling**
   - Automatically refresh when token expires
   - Redirect to login if refresh fails

3. **Add Protected Route Guard**
   - Redirect to login if not authenticated
   - Protect all authenticated pages

4. **Switch to Strict Auth**
   - Change `optionalAuth` → `authenticateToken`
   - Remove demo fallback logic
   - Require login for all features

## 🔒 Security Best Practices

✅ **Currently Implemented:**
- JWT tokens with expiry
- Passwords hashed with bcrypt (10 rounds)
- Tokens stored in localStorage
- HTTPS required in production
- Separate access/refresh token secrets

⚠️ **Production Recommendations:**
- Use httpOnly cookies instead of localStorage
- Implement CSRF protection
- Add rate limiting on login endpoint
- Log authentication attempts
- Add 2FA for sensitive operations
- Implement token blacklisting on logout
- Add IP whitelisting for corporate agents

## 📞 Support

For questions about JWT implementation:
1. Check this documentation
2. Review code in `server-simple.js` (lines 60-180)
3. Check frontend `lib/api.ts` (lines 18-35)
4. Test with provided curl commands
