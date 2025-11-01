import { SearchDoctorsQuery, CreateDoctorInput, UpdateDoctorInput, GetAvailableSlotsQuery } from './doctor.validation';
export declare class DoctorService {
    /**
     * Search doctors with filters and pagination
     */
    static searchDoctors(query: SearchDoctorsQuery): Promise<{
        doctors: ({
            _count: {
                appointments: number;
            };
        } & {
            email: string | null;
            name: string;
            phone: string | null;
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            specialty: string;
            hospital: string;
            consultationFee: number;
            rating: number;
            photoUrl: string | null;
            availableDates: import("@prisma/client/runtime/library").JsonValue | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    /**
     * Get doctor by ID
     */
    static getDoctorById(doctorId: string): Promise<{
        appointments: {
            status: import(".prisma/client").$Enums.AppointmentStatus;
            date: Date;
            id: string;
            patientName: string;
            timeSlot: string;
        }[];
        _count: {
            appointments: number;
        };
    } & {
        email: string | null;
        name: string;
        phone: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        specialty: string;
        hospital: string;
        consultationFee: number;
        rating: number;
        photoUrl: string | null;
        availableDates: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    /**
     * Create new doctor (admin only)
     */
    static createDoctor(data: CreateDoctorInput): Promise<{
        email: string | null;
        name: string;
        phone: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        specialty: string;
        hospital: string;
        consultationFee: number;
        rating: number;
        photoUrl: string | null;
        availableDates: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    /**
     * Update doctor (admin only)
     */
    static updateDoctor(doctorId: string, data: UpdateDoctorInput): Promise<{
        email: string | null;
        name: string;
        phone: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        specialty: string;
        hospital: string;
        consultationFee: number;
        rating: number;
        photoUrl: string | null;
        availableDates: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    /**
     * Delete doctor (admin only - soft delete)
     */
    static deleteDoctor(doctorId: string): Promise<{
        message: string;
    }>;
    /**
     * Get available time slots for a doctor
     */
    static getAvailableSlots(doctorId: string, query: GetAvailableSlotsQuery): Promise<{
        date: string;
        slots: any;
    } | {
        date: any;
        slots: any;
    }[]>;
    /**
     * Get doctor specialties (for filtering)
     */
    static getSpecialties(): Promise<string[]>;
    /**
     * Get hospitals (for filtering)
     */
    static getHospitals(): Promise<string[]>;
    /**
     * Update doctor availability
     */
    static updateAvailability(doctorId: string, availableDates: any[]): Promise<{
        email: string | null;
        name: string;
        phone: string | null;
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        specialty: string;
        hospital: string;
        consultationFee: number;
        rating: number;
        photoUrl: string | null;
        availableDates: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
//# sourceMappingURL=doctor.service.d.ts.map