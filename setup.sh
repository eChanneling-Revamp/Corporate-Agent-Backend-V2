#!/bin/bash

# Corporate Agent Backend Setup Script
# This script sets up the development environment and starts the server

set -e  # Exit on any error

echo "🚀 Corporate Agent Backend Setup"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt "18" ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📄 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your actual configuration before starting the server."
else
    echo "✅ .env file already exists"
fi

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if database is configured
if grep -q "username:password@localhost:5432" .env; then
    echo ""
    echo "⚠️  Database configuration detected as default."
    echo "   Please update DATABASE_URL in .env with your actual PostgreSQL connection string."
    echo ""
    echo "   Example: postgresql://user:password@localhost:5432/corporate_agent_db"
    echo ""
    read -p "   Have you configured your database? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "   Please configure your database and run this script again."
        exit 1
    fi
fi

# Run database migrations
echo ""
echo "🗄️  Running database migrations..."
if npx prisma migrate dev --name init; then
    echo "✅ Database migrations completed successfully"
else
    echo "❌ Database migration failed. Please check your database configuration."
    echo "   Make sure PostgreSQL is running and the DATABASE_URL is correct."
    exit 1
fi

# Ask if user wants to seed the database
echo ""
read -p "🌱 Do you want to seed the database with sample data? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   Seeding database..."
    npm run db:seed
    echo "✅ Database seeded successfully"
fi

# Build the project
echo ""
echo "🏗️  Building the project..."
npm run build

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Available commands:"
echo "  npm run dev      - Start development server with hot reload"
echo "  npm start        - Start production server"
echo "  npm run lint     - Run ESLint"
echo "  npm test         - Run tests"
echo "  npm run db:studio - Open Prisma Studio"
echo ""

# Ask if user wants to start the development server
read -p "🚀 Do you want to start the development server now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🏃 Starting development server..."
    echo "   Server will be available at http://localhost:3001"
    echo "   Press Ctrl+C to stop the server"
    echo ""
    npm run dev
else
    echo ""
    echo "✅ You can start the server later with: npm run dev"
    echo "   Server will be available at http://localhost:3001"
fi