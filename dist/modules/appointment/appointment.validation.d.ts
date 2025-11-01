import { z } from 'zod';
export declare const createAppointmentSchema: z.ZodObject<{
    body: z.ZodObject<{
        doctorId: z.ZodString;
        patientName: z.ZodString;
        patientEmail: z.ZodString;
        patientPhone: z.ZodString;
        date: z.ZodEffects<z.ZodString, string, string>;
        timeSlot: z.ZodString;
        amount: z.ZodNumber;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        date: string;
        amount: number;
        doctorId: string;
        patientName: string;
        patientEmail: string;
        patientPhone: string;
        timeSlot: string;
        notes?: string | undefined;
    }, {
        date: string;
        amount: number;
        doctorId: string;
        patientName: string;
        patientEmail: string;
        patientPhone: string;
        timeSlot: string;
        notes?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        date: string;
        amount: number;
        doctorId: string;
        patientName: string;
        patientEmail: string;
        patientPhone: string;
        timeSlot: string;
        notes?: string | undefined;
    };
}, {
    body: {
        date: string;
        amount: number;
        doctorId: string;
        patientName: string;
        patientEmail: string;
        patientPhone: string;
        timeSlot: string;
        notes?: string | undefined;
    };
}>;
export declare const bulkCreateAppointmentsSchema: z.ZodObject<{
    body: z.ZodObject<{
        appointments: z.ZodArray<z.ZodObject<{
            doctorId: z.ZodString;
            patientName: z.ZodString;
            patientEmail: z.ZodString;
            patientPhone: z.ZodString;
            date: z.ZodEffects<z.ZodString, string, string>;
            timeSlot: z.ZodString;
            amount: z.ZodNumber;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            date: string;
            amount: number;
            doctorId: string;
            patientName: string;
            patientEmail: string;
            patientPhone: string;
            timeSlot: string;
            notes?: string | undefined;
        }, {
            date: string;
            amount: number;
            doctorId: string;
            patientName: string;
            patientEmail: string;
            patientPhone: string;
            timeSlot: string;
            notes?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        appointments: {
            date: string;
            amount: number;
            doctorId: string;
            patientName: string;
            patientEmail: string;
            patientPhone: string;
            timeSlot: string;
            notes?: string | undefined;
        }[];
    }, {
        appointments: {
            date: string;
            amount: number;
            doctorId: string;
            patientName: string;
            patientEmail: string;
            patientPhone: string;
            timeSlot: string;
            notes?: string | undefined;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        appointments: {
            date: string;
            amount: number;
            doctorId: string;
            patientName: string;
            patientEmail: string;
            patientPhone: string;
            timeSlot: string;
            notes?: string | undefined;
        }[];
    };
}, {
    body: {
        appointments: {
            date: string;
            amount: number;
            doctorId: string;
            patientName: string;
            patientEmail: string;
            patientPhone: string;
            timeSlot: string;
            notes?: string | undefined;
        }[];
    };
}>;
export declare const listAppointmentsSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        limit: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        status: z.ZodOptional<z.ZodEnum<["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]>>;
        doctorId: z.ZodOptional<z.ZodString>;
        patientName: z.ZodOptional<z.ZodString>;
        dateFrom: z.ZodOptional<z.ZodString>;
        dateTo: z.ZodOptional<z.ZodString>;
        sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["date", "createdAt", "patientName", "status"]>>>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        page: number;
        sortBy: "status" | "date" | "createdAt" | "patientName";
        sortOrder: "asc" | "desc";
        status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        doctorId?: string | undefined;
        patientName?: string | undefined;
    }, {
        limit?: string | undefined;
        status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" | undefined;
        page?: string | undefined;
        sortBy?: "status" | "date" | "createdAt" | "patientName" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        doctorId?: string | undefined;
        patientName?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        limit: number;
        page: number;
        sortBy: "status" | "date" | "createdAt" | "patientName";
        sortOrder: "asc" | "desc";
        status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        doctorId?: string | undefined;
        patientName?: string | undefined;
    };
}, {
    query: {
        limit?: string | undefined;
        status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" | undefined;
        page?: string | undefined;
        sortBy?: "status" | "date" | "createdAt" | "patientName" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
        doctorId?: string | undefined;
        patientName?: string | undefined;
    };
}>;
export declare const getAppointmentSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
export declare const updateAppointmentSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        patientName: z.ZodOptional<z.ZodString>;
        patientEmail: z.ZodOptional<z.ZodString>;
        patientPhone: z.ZodOptional<z.ZodString>;
        date: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        timeSlot: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]>>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" | undefined;
        date?: string | undefined;
        patientName?: string | undefined;
        patientEmail?: string | undefined;
        patientPhone?: string | undefined;
        timeSlot?: string | undefined;
        notes?: string | undefined;
    }, {
        status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" | undefined;
        date?: string | undefined;
        patientName?: string | undefined;
        patientEmail?: string | undefined;
        patientPhone?: string | undefined;
        timeSlot?: string | undefined;
        notes?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" | undefined;
        date?: string | undefined;
        patientName?: string | undefined;
        patientEmail?: string | undefined;
        patientPhone?: string | undefined;
        timeSlot?: string | undefined;
        notes?: string | undefined;
    };
    params: {
        id: string;
    };
}, {
    body: {
        status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW" | undefined;
        date?: string | undefined;
        patientName?: string | undefined;
        patientEmail?: string | undefined;
        patientPhone?: string | undefined;
        timeSlot?: string | undefined;
        notes?: string | undefined;
    };
    params: {
        id: string;
    };
}>;
export declare const cancelAppointmentSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        reason: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        reason: string;
    }, {
        reason: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        reason: string;
    };
    params: {
        id: string;
    };
}, {
    body: {
        reason: string;
    };
    params: {
        id: string;
    };
}>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>['body'];
export type BulkCreateAppointmentsInput = z.infer<typeof bulkCreateAppointmentsSchema>['body'];
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsSchema>['query'];
export type GetAppointmentParams = z.infer<typeof getAppointmentSchema>['params'];
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>['body'];
export type UpdateAppointmentParams = z.infer<typeof updateAppointmentSchema>['params'];
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>['body'];
export type CancelAppointmentParams = z.infer<typeof cancelAppointmentSchema>['params'];
//# sourceMappingURL=appointment.validation.d.ts.map