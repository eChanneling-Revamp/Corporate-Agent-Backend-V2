const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Authentication middleware and routes to add to existing server
const authRoutes = {
  // Login endpoint
  login: async (req, res) => {
    try {
      console.log('API call to /api/auth/login');
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user with agent data
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          agent: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT tokens
      const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      const accessSecret = process.env.JWT_ACCESS_SECRET || 'corporate-agent-neon-jwt-access-secret-2024-production-ready-key-v1';
      const refreshSecret = process.env.JWT_REFRESH_SECRET || 'corporate-agent-neon-jwt-refresh-secret-2024-production-ready-key-v1';

      const accessToken = jwt.sign(payload, accessSecret, { 
        expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' 
      });

      const refreshToken = jwt.sign(payload, refreshSecret, { 
        expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' 
      });

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      console.log('User logged in successfully:', user.email);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          agent: user.agent ? {
            id: user.agent.id,
            name: user.agent.name,
            companyName: user.agent.companyName,
            email: user.agent.email,
          } : null,
          tokens: {
            accessToken,
            refreshToken,
          },
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message || 'Unknown error',
      });
    }
  },

  // Logout endpoint
  logout: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Remove refresh token from database
        await prisma.refreshToken.deleteMany({
          where: { token: refreshToken },
        });
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error.message || 'Unknown error',
      });
    }
  }
};

module.exports = authRoutes;