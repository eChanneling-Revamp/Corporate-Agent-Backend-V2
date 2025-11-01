# Development Guide

## Quick Start

### Windows Users
```bash
# Run the setup script
./setup.bat
```

### Linux/Mac Users  
```bash
# Make script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

### Manual Setup
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your database configuration

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run db:seed

# Start development server
npm run dev
```

## Environment Configuration

Update `.env` file with your configuration:

```env
# Database - Replace with your PostgreSQL connection
DATABASE_URL="postgresql://username:password@localhost:5432/corporate_agent_db"

# JWT Secrets - Generate secure secrets for production
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS - Add your frontend URL
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
```

## Database Setup

1. **Install PostgreSQL** (if not installed)
   - Windows: Download from https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Ubuntu: `sudo apt install postgresql postgresql-contrib`

2. **Create Database**
   ```sql
   CREATE DATABASE corporate_agent_db;
   ```

3. **Update DATABASE_URL** in `.env` file

4. **Run Migrations**
   ```bash
   npx prisma migrate dev
   ```

## Development Workflow

### Starting Development
```bash
npm run dev  # Starts server with hot reload on port 3001
```

### Database Operations
```bash
npm run db:studio     # Open Prisma Studio (database GUI)
npm run db:migrate    # Run new migrations
npm run db:seed       # Seed database with sample data
npm run db:reset      # Reset database (caution: deletes all data)
```

### Code Quality
```bash
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues automatically
npm run format        # Format code with Prettier
npm run type-check    # Check TypeScript types
```

### Testing
```bash
npm test              # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Building for Production
```bash
npm run build         # Build the application
npm start             # Start production server
```

## API Testing

### Default Credentials
- **Admin**: admin@echannelling.com / admin123
- **Agent**: agent@corporate.com / agent123

### Sample API Calls

1. **Login**
   ```bash
   POST http://localhost:3001/api/auth/login
   {
     "email": "agent@corporate.com",
     "password": "agent123"
   }
   ```

2. **Get Doctors**
   ```bash
   GET http://localhost:3001/api/doctors
   Authorization: Bearer <your_token>
   ```

3. **Create Appointment**
   ```bash
   POST http://localhost:3001/api/appointments
   Authorization: Bearer <your_token>
   {
     "doctorId": "doctor_id_here",
     "patientName": "John Doe",
     "patientEmail": "john@email.com",
     "patientPhone": "+94771234567",
     "date": "2024-01-15",
     "timeSlot": "09:00",
     "amount": 3000
   }
   ```

## Project Structure

```
src/
├── config/           # Configuration files
├── middleware/       # Express middleware
├── modules/          # Feature modules
│   ├── auth/         # Authentication
│   ├── agent/        # Agent management
│   ├── doctor/       # Doctor management
│   ├── appointment/  # Appointments
│   ├── payment/      # Payments (to be implemented)
│   ├── report/       # Reports (to be implemented)
│   └── profile/      # User profiles (to be implemented)
├── utils/            # Utility functions
├── scripts/          # Database scripts
├── app.ts            # Express app setup
└── server.ts         # Server startup
```

## WebSocket Integration

The system includes real-time features via WebSocket:
- Live appointment updates
- Real-time notifications  
- Dashboard data updates

WebSocket events are handled in `src/utils/websocket.ts`

## Error Handling

All errors are centrally handled by the error middleware:
- Validation errors (Zod)
- Database errors (Prisma)
- Authentication errors (JWT)
- Custom business logic errors

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Input validation with Zod
- Security headers with Helmet

## Logging

Winston-based logging system:
- Structured JSON logs
- Different log levels (error, warn, info, debug)
- File and console outputs
- Request/response logging

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing process: `lsof -ti:3001 | xargs kill -9` (Mac/Linux)

3. **Migration Errors**
   - Reset database: `npm run db:reset`
   - Check database permissions

4. **TypeScript Errors**
   - Install missing type definitions: `npm install --save-dev @types/package-name`
   - Run type check: `npm run type-check`

### Getting Help

- Check the logs in `./logs` directory
- Use Prisma Studio to inspect database: `npm run db:studio`
- Run with debug mode: `DEBUG=* npm run dev`

## Next Steps

1. Complete remaining modules (payment, report, profile)
2. Add comprehensive tests
3. Implement caching with Redis
4. Add email notifications
5. Set up CI/CD pipeline
6. Deploy to production

## Contributing

1. Create feature branch
2. Make changes with tests
3. Run linting and tests
4. Submit pull request