@echo off
REM Corporate Agent Backend Setup Script for Windows
REM This script sets up the development environment and starts the server

echo 🚀 Corporate Agent Backend Setup
echo ==================================

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ npm version: 
npm --version

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Copy environment file if it doesn't exist
if not exist .env (
    echo.
    echo 📄 Creating .env file from example...
    copy .env.example .env
    echo ⚠️  Please update the .env file with your actual configuration before starting the server.
) else (
    echo ✅ .env file already exists
)

REM Generate Prisma client
echo.
echo 🔧 Generating Prisma client...
call npx prisma generate
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

REM Check database configuration
findstr /C:"username:password@localhost:5432" .env >nul
if %ERRORLEVEL% equ 0 (
    echo.
    echo ⚠️  Database configuration detected as default.
    echo    Please update DATABASE_URL in .env with your actual PostgreSQL connection string.
    echo.
    echo    Example: postgresql://user:password@localhost:5432/corporate_agent_db
    echo.
    set /p confirm="   Have you configured your database? (y/n): "
    if /i not "%confirm%"=="y" (
        echo    Please configure your database and run this script again.
        pause
        exit /b 1
    )
)

REM Run database migrations
echo.
echo 🗄️  Running database migrations...
call npx prisma migrate dev --name init
if %ERRORLEVEL% neq 0 (
    echo ❌ Database migration failed. Please check your database configuration.
    echo    Make sure PostgreSQL is running and the DATABASE_URL is correct.
    pause
    exit /b 1
)
echo ✅ Database migrations completed successfully

REM Ask if user wants to seed the database
echo.
set /p seed="🌱 Do you want to seed the database with sample data? (y/n): "
if /i "%seed%"=="y" (
    echo    Seeding database...
    call npm run db:seed
    if %ERRORLEVEL% equ 0 (
        echo ✅ Database seeded successfully
    ) else (
        echo ⚠️  Database seeding failed, but continuing...
    )
)

REM Build the project
echo.
echo 🏗️  Building the project...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo Available commands:
echo   npm run dev      - Start development server with hot reload
echo   npm start        - Start production server
echo   npm run lint     - Run ESLint
echo   npm test         - Run tests
echo   npm run db:studio - Open Prisma Studio
echo.

REM Ask if user wants to start the development server
set /p startdev="🚀 Do you want to start the development server now? (y/n): "
if /i "%startdev%"=="y" (
    echo.
    echo 🏃 Starting development server...
    echo    Server will be available at http://localhost:3001
    echo    Press Ctrl+C to stop the server
    echo.
    call npm run dev
) else (
    echo.
    echo ✅ You can start the server later with: npm run dev
    echo    Server will be available at http://localhost:3001
)

pause