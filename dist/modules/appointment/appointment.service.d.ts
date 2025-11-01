import { CreateAppointmentInput, BulkCreateAppointmentsInput, ListAppointmentsQuery, UpdateAppointmentInput, CancelAppointmentInput } from './appointment.validation';
export declare class AppointmentService {
    /**
     * Create a new appointment
     */
    static createAppointment(agentId: string, data: CreateAppointmentInput): Promise<{
        agent: {
            name: string;
            companyName: string | null;
            id: string;
        };
        doctor: {
            name: string;
            id: string;
            specialty: string;
            hospital: string;
        };
    } & {
        status: import(".prisma/client").$Enums.AppointmentStatus;
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        agentId: string;
        amount: number;
        doctorId: string;
        patientName: string;
        patientEmail: string;
        patientPhone: string;
        timeSlot: string;
        notes: string | null;
        cancelReason: string | null;
        paymentId: string | null;
    }>;
    /**
     * Bulk create appointments
     */
    static bulkCreateAppointments(agentId: string, data: BulkCreateAppointmentsInput): Promise<{
        created: any[];
        failed: Array<{
            data: any;
            error: string;
        }>;
    }>;
    /**
     * List appointments with filters and pagination
     */
    static listAppointments(agentId: string, query: ListAppointmentsQuery, isAdmin?: boolean): Promise<{
        appointments: ({
            agent: {
                name: string;
                companyName: string | null;
                id: string;
            };
            doctor: {
                name: string;
                id: string;
                specialty: string;
                hospital: string;
                consultationFee: number;
            };
            payment: {
                status: import(".prisma/client").$Enums.PaymentStatus;
                id: string;
                amount: number;
                method: import(".prisma/client").$Enums.PaymentMethod;
            } | null;
        } & {
            status: import(".prisma/client").$Enums.AppointmentStatus;
            date: Date;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            agentId: string;
            amount: number;
            doctorId: string;
            patientName: string;
            patientEmail: string;
            patientPhone: string;
            timeSlot: string;
            notes: string | null;
            cancelReason: string | null;
            paymentId: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    /**
     * Get appointment by ID
     */
    static getAppointmentById(appointmentId: string, agentId?: string): Promise<{
        agent: {
            email: string;
            name: string;
            companyName: string | null;
            phone: string | null;
            id: string;
        };
        doctor: {
            email: string | null;
            name: string;
            phone: string | null;
            id: string;
            specialty: string;
            hospital: string;
            consultationFee: number;
        };
        payment: {
            status: import(".prisma/client").$Enums.PaymentStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            agentId: string | null;
            amount: number;
            notes: string | null;
            method: import(".prisma/client").$Enums.PaymentMethod;
            transactionId: string | null;
            processedAt: Date | null;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.AppointmentStatus;
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        agentId: string;
        amount: number;
        doctorId: string;
        patientName: string;
        patientEmail: string;
        patientPhone: string;
        timeSlot: string;
        notes: string | null;
        cancelReason: string | null;
        paymentId: string | null;
    }>;
    /**
     * Update appointment
     */
    static updateAppointment(appointmentId: string, data: UpdateAppointmentInput, agentId?: string): Promise<{
        agent: {
            name: string;
            companyName: string | null;
            id: string;
        };
        doctor: {
            name: string;
            id: string;
            specialty: string;
            hospital: string;
        };
        payment: {
            status: import(".prisma/client").$Enums.PaymentStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            agentId: string | null;
            amount: number;
            notes: string | null;
            method: import(".prisma/client").$Enums.PaymentMethod;
            transactionId: string | null;
            processedAt: Date | null;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.AppointmentStatus;
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        agentId: string;
        amount: number;
        doctorId: string;
        patientName: string;
        patientEmail: string;
        patientPhone: string;
        timeSlot: string;
        notes: string | null;
        cancelReason: string | null;
        paymentId: string | null;
    }>;
    /**
     * Confirm appointment
     */
    static confirmAppointment(appointmentId: string, agentId?: string): Promise<{
        agent: {
            name: string;
            companyName: string | null;
            id: string;
        };
        doctor: {
            name: string;
            id: string;
            specialty: string;
            hospital: string;
        };
        payment: {
            status: import(".prisma/client").$Enums.PaymentStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            agentId: string | null;
            amount: number;
            notes: string | null;
            method: import(".prisma/client").$Enums.PaymentMethod;
            transactionId: string | null;
            processedAt: Date | null;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.AppointmentStatus;
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        agentId: string;
        amount: number;
        doctorId: string;
        patientName: string;
        patientEmail: string;
        patientPhone: string;
        timeSlot: string;
        notes: string | null;
        cancelReason: string | null;
        paymentId: string | null;
    }>;
    /**
     * Cancel appointment
     */
    static cancelAppointment(appointmentId: string, data: CancelAppointmentInput, agentId?: string): Promise<{
        agent: {
            name: string;
            companyName: string | null;
            id: string;
        };
        doctor: {
            name: string;
            id: string;
            specialty: string;
            hospital: string;
        };
        payment: {
            status: import(".prisma/client").$Enums.PaymentStatus;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            agentId: string | null;
            amount: number;
            notes: string | null;
            method: import(".prisma/client").$Enums.PaymentMethod;
            transactionId: string | null;
            processedAt: Date | null;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.AppointmentStatus;
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        agentId: string;
        amount: number;
        doctorId: string;
        patientName: string;
        patientEmail: string;
        patientPhone: string;
        timeSlot: string;
        notes: string | null;
        cancelReason: string | null;
        paymentId: string | null;
    }>;
    /**
     * Get unpaid appointments (for ACB confirmation)
     */
    static getUnpaidAppointments(agentId?: string): Promise<({
        agent: {
            name: string;
            companyName: string | null;
            id: string;
        };
        doctor: {
            name: string;
            id: string;
            specialty: string;
            hospital: string;
        };
    } & {
        status: import(".prisma/client").$Enums.AppointmentStatus;
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        agentId: string;
        amount: number;
        doctorId: string;
        patientName: string;
        patientEmail: string;
        patientPhone: string;
        timeSlot: string;
        notes: string | null;
        cancelReason: string | null;
        paymentId: string | null;
    })[]>;
}
//# sourceMappingURL=appointment.service.d.ts.map