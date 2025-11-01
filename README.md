# Corporate Agent Backend Module

A comprehensive Node.js backend for the eChannelling Corporate Agent system, built with Express.js, TypeScript, Prisma, and PostgreSQL.

## Features

- **Authentication & Authorization**: JWT-based authentication with refresh tokens
- **Agent Management**: Complete CRUD operations for corporate agents
- **Doctor Management**: Search, filtering, and availability management
- **Appointment System**: Single and bulk appointment booking with real-time updates
- **Payment Processing**: Transaction management and payment tracking
- **Reporting & Analytics**: Comprehensive reporting system
- **Real-time Communication**: WebSocket integration for live updates
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Logging**: Winston-based structured logging
- **Database**: Prisma ORM with PostgreSQL

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Real-time**: Socket.IO
- **Logging**: Winston
- **Security**: Helmet, bcrypt, CORS

## Project Structure

```
src/
├── config/           # Configuration files
│   ├── database.ts   # Database configuration
│   ├── logger.ts     # Logging configuration
│   └── prisma.ts     # Prisma client
├── middleware/       # Express middleware
│   ├── auth.ts       # Authentication middleware
│   ├── cors.ts       # CORS configuration
│   ├── errorHandler.ts # Error handling
│   ├── rateLimiter.ts  # Rate limiting
│   ├── security.ts     # Security headers
│   └── validation.ts   # Request validation
├── modules/          # Feature modules
│   ├── auth/         # Authentication module
│   ├── agent/        # Agent management
│   ├── doctor/       # Doctor management
│   ├── appointment/  # Appointment system
│   ├── payment/      # Payment processing
│   ├── report/       # Reporting system
│   └── profile/      # Profile management
├── utils/            # Utility functions
│   ├── jwt.ts        # JWT utilities
│   ├── response.ts   # Response helpers
│   └── websocket.ts  # WebSocket utilities
├── app.ts            # Express app setup
└── server.ts         # Server startup
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server
   NODE_ENV=development
   PORT=3001
   
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/corporate_agent_db
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   
   # CORS
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # (Optional) Seed database
   npx prisma db seed
   ```

5. **Start the server**
   ```bash
   # Development mode with hot reload
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new agent
- `POST /api/auth/login` - Agent login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout agent

### Agent Endpoints

- `GET /api/agents/profile` - Get agent profile
- `PUT /api/agents/profile` - Update agent profile
- `GET /api/agents/dashboard` - Get dashboard statistics

### Doctor Endpoints

- `GET /api/doctors` - Search doctors with filters
- `GET /api/doctors/:id` - Get doctor details
- `GET /api/doctors/:id/availability` - Get doctor availability

### Appointment Endpoints

- `POST /api/appointments` - Create single appointment
- `POST /api/appointments/bulk` - Bulk create appointments
- `GET /api/appointments` - List appointments with filters
- `GET /api/appointments/:id` - Get appointment details
- `PATCH /api/appointments/:id` - Update appointment
- `POST /api/appointments/:id/confirm` - Confirm appointment
- `POST /api/appointments/:id/cancel` - Cancel appointment
- `GET /api/appointments/unpaid` - Get unpaid appointments

### Payment Endpoints

- `POST /api/payments` - Process payment
- `GET /api/payments` - List payments
- `GET /api/payments/:id` - Get payment details

### Report Endpoints

- `GET /api/reports/appointments` - Appointment reports
- `GET /api/reports/revenue` - Revenue reports
- `GET /api/reports/export` - Export reports

## Database Schema

The system uses the following main entities:

- **User**: System users (agents, admins)
- **Agent**: Corporate agent profiles
- **Doctor**: Doctor information and availability
- **Appointment**: Appointment bookings
- **Payment**: Payment transactions
- **Report**: System reports
- **Integration**: External system integrations
- **RefreshToken**: JWT refresh tokens
- **AuditLog**: System audit logs

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run db:reset` - Reset database
- `npm run db:seed` - Seed database

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write comprehensive JSDoc comments
- Implement proper error handling
- Use Zod for input validation

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set secure JWT secrets
- [ ] Configure CORS for production domains
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Docker Deployment

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 3001 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_REFRESH_SECRET` | JWT refresh secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | 15m |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | 7d |
| `ALLOWED_ORIGINS` | CORS allowed origins | http://localhost:3000 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Zod schema validation
- **CORS Configuration**: Controlled cross-origin requests
- **Security Headers**: Helmet middleware protection
- **SQL Injection Protection**: Prisma ORM parameterized queries
- **XSS Protection**: Input sanitization

## Real-time Features

The system includes WebSocket integration for real-time updates:

- Live appointment status changes
- Real-time notifications
- Dashboard data updates
- Payment confirmations

## Error Handling

Comprehensive error handling with:

- Structured error responses
- Proper HTTP status codes
- Detailed error logging
- Validation error messages
- Database error handling

## Logging

Winston-based logging with:

- Structured log format
- Different log levels
- File and console output
- Request/response logging
- Error tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## Changelog

### v1.0.0 (Initial Release)
- Authentication system with JWT
- Agent management module
- Doctor search and management
- Appointment booking system
- Payment processing
- Reporting functionality
- Real-time WebSocket integration
- Comprehensive security measures