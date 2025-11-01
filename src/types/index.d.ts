import { Request } from 'express';
import { Agent, User } from '@prisma/client';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  agent?: Agent;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AppointmentFilters {
  status?: string;
  doctorId?: string;
  dateFrom?: string;
  dateTo?: string;
  patientName?: string;
}

export interface DoctorFilters {
  specialty?: string;
  hospital?: string;
  name?: string;
  availableDate?: string;
}

export interface PaymentFilters {
  status?: string;
  method?: string;
  dateFrom?: string;
  dateTo?: string;
  agentId?: string;
}

export interface ReportFilters {
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  agentId?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

export interface WebSocketEvent {
  event: string;
  data: any;
  userId?: string;
  agentId?: string;
}

export interface BulkAppointmentData {
  doctorId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  date: string;
  timeSlot: string;
  amount: number;
  notes?: string;
}

export interface DashboardStats {
  totalAppointments: number;
  pendingConfirmations: number;
  revenue: number;
  revenueChange: number;
  appointmentsChange: number;
  topDoctors: Array<{
    id: string;
    name: string;
    appointmentCount: number;
  }>;
  recentAppointments: any[];
}

export interface NotificationData {
  type: 'appointment_created' | 'appointment_updated' | 'payment_received' | 'system_alert';
  title: string;
  message: string;
  data?: any;
  recipientId?: string;
  agentId?: string;
}