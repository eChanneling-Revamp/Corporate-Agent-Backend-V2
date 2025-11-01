import { z } from 'zod';
export declare const searchDoctorsSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        limit: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        search: z.ZodOptional<z.ZodString>;
        specialty: z.ZodOptional<z.ZodString>;
        hospital: z.ZodOptional<z.ZodString>;
        availableDate: z.ZodOptional<z.ZodString>;
        minFee: z.ZodEffects<z.ZodOptional<z.ZodString>, number | undefined, string | undefined>;
        maxFee: z.ZodEffects<z.ZodOptional<z.ZodString>, number | undefined, string | undefined>;
        minRating: z.ZodEffects<z.ZodOptional<z.ZodString>, number | undefined, string | undefined>;
        sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["name", "specialty", "hospital", "consultationFee", "rating", "createdAt"]>>>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        page: number;
        sortBy: "name" | "createdAt" | "specialty" | "hospital" | "consultationFee" | "rating";
        sortOrder: "asc" | "desc";
        search?: string | undefined;
        specialty?: string | undefined;
        hospital?: string | undefined;
        availableDate?: string | undefined;
        minFee?: number | undefined;
        maxFee?: number | undefined;
        minRating?: number | undefined;
    }, {
        limit?: string | undefined;
        search?: string | undefined;
        page?: string | undefined;
        sortBy?: "name" | "createdAt" | "specialty" | "hospital" | "consultationFee" | "rating" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        specialty?: string | undefined;
        hospital?: string | undefined;
        availableDate?: string | undefined;
        minFee?: string | undefined;
        maxFee?: string | undefined;
        minRating?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        limit: number;
        page: number;
        sortBy: "name" | "createdAt" | "specialty" | "hospital" | "consultationFee" | "rating";
        sortOrder: "asc" | "desc";
        search?: string | undefined;
        specialty?: string | undefined;
        hospital?: string | undefined;
        availableDate?: string | undefined;
        minFee?: number | undefined;
        maxFee?: number | undefined;
        minRating?: number | undefined;
    };
}, {
    query: {
        limit?: string | undefined;
        search?: string | undefined;
        page?: string | undefined;
        sortBy?: "name" | "createdAt" | "specialty" | "hospital" | "consultationFee" | "rating" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        specialty?: string | undefined;
        hospital?: string | undefined;
        availableDate?: string | undefined;
        minFee?: string | undefined;
        maxFee?: string | undefined;
        minRating?: string | undefined;
    };
}>;
export declare const getDoctorSchema: z.ZodObject<{
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
export declare const createDoctorSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        specialty: z.ZodString;
        hospital: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        consultationFee: z.ZodNumber;
        rating: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        photoUrl: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        availableDates: z.ZodOptional<z.ZodArray<z.ZodObject<{
            date: z.ZodString;
            timeSlots: z.ZodArray<z.ZodObject<{
                time: z.ZodString;
                available: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                time: string;
                available: boolean;
            }, {
                time: string;
                available: boolean;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            date: string;
            timeSlots: {
                time: string;
                available: boolean;
            }[];
        }, {
            date: string;
            timeSlots: {
                time: string;
                available: boolean;
            }[];
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        specialty: string;
        hospital: string;
        consultationFee: number;
        rating: number;
        email?: string | undefined;
        phone?: string | undefined;
        description?: string | undefined;
        photoUrl?: string | undefined;
        availableDates?: {
            date: string;
            timeSlots: {
                time: string;
                available: boolean;
            }[];
        }[] | undefined;
    }, {
        name: string;
        specialty: string;
        hospital: string;
        consultationFee: number;
        email?: string | undefined;
        phone?: string | undefined;
        description?: string | undefined;
        rating?: number | undefined;
        photoUrl?: string | undefined;
        availableDates?: {
            date: string;
            timeSlots: {
                time: string;
                available: boolean;
            }[];
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        specialty: string;
        hospital: string;
        consultationFee: number;
        rating: number;
        email?: string | undefined;
        phone?: string | undefined;
        description?: string | undefined;
        photoUrl?: string | undefined;
        availableDates?: {
            date: string;
            timeSlots: {
                time: string;
                available: boolean;
            }[];
        }[] | undefined;
    };
}, {
    body: {
        name: string;
        specialty: string;
        hospital: string;
        consultationFee: number;
        email?: string | undefined;
        phone?: string | undefined;
        description?: string | undefined;
        rating?: number | undefined;
        photoUrl?: string | undefined;
        availableDates?: {
            date: string;
            timeSlots: {
                time: string;
                available: boolean;
            }[];
        }[] | undefined;
    };
}>;
export declare const updateDoctorSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        specialty: z.ZodOptional<z.ZodString>;
        hospital: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        consultationFee: z.ZodOptional<z.ZodNumber>;
        rating: z.ZodOptional<z.ZodNumber>;
        photoUrl: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        availableDates: z.ZodOptional<z.ZodArray<z.ZodObject<{
            date: z.ZodString;
            timeSlots: z.ZodArray<z.ZodObject<{
                time: z.ZodString;
                available: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                time: string;
                available: boolean;
            }, {
                time: string;
                available: boolean;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            date: string;
            timeSlots: {
                time: string;
                available: boolean;
            }[];
        }, {
            date: string;
            timeSlots: {
                time: string;
                available: boolean;
            }[];
        }>, "many">>;
        isActive: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        email?: string | undefined;
        name?: string | undefined;
        phone?: string | undefined;
        isActive?: boolean | undefined;
        description?: string | undefined;
        specialty?: string | undefined;
        hospital?: string | undefined;
        consultationFee?: number | undefined;
        rating?: number | undefined;
        photoUrl?: string | undefined;
        availableDates?: {
            date: string;
            timeSlots: {
                time: string;
                available: boolean;
            }[];
        }[] | undefined;
    }, {
        email?: string | undefined;
        name?: string | undefined;
        phone?: string | undefined;
        isActive?: boolean | undefined;
        description?: string | undefined;
        specialty?: string | undefined;
        hospital?: string | undefined;
        consultationFee?: number | undefined;
        rating?: number | undefined;
        photoUrl?: string | undefined;
        availableDates?: {
            date: string;
            timeSlots: {
                time: string;
                available: boolean;
            }[];
        }[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email?: string | undefined;
        name?: string | undefined;
        phone?: string | undefined;
        isActive?: boolean | undefined;
        description?: string | undefined;
        specialty?: string | undefined;
        hospital?: string | undefined;
        consultationFee?: number | undefined;
        rating?: number | undefined;
        photoUrl?: string | undefined;
        availableDates?: {
            date: string;
            timeSlots: {
                time: string;
                available: boolean;
            }[];
        }[] | undefined;
    };
    params: {
        id: string;
    };
}, {
    body: {
        email?: string | undefined;
        name?: string | undefined;
        phone?: string | undefined;
        isActive?: boolean | undefined;
        description?: string | undefined;
        specialty?: string | undefined;
        hospital?: string | undefined;
        consultationFee?: number | undefined;
        rating?: number | undefined;
        photoUrl?: string | undefined;
        availableDates?: {
            date: string;
            timeSlots: {
                time: string;
                available: boolean;
            }[];
        }[] | undefined;
    };
    params: {
        id: string;
    };
}>;
export declare const getAvailableSlotsSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    query: z.ZodObject<{
        date: z.ZodOptional<z.ZodString>;
        dateFrom: z.ZodOptional<z.ZodString>;
        dateTo: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        date?: string | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
    }, {
        date?: string | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        date?: string | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
    };
    params: {
        id: string;
    };
}, {
    query: {
        date?: string | undefined;
        dateFrom?: string | undefined;
        dateTo?: string | undefined;
    };
    params: {
        id: string;
    };
}>;
export type SearchDoctorsQuery = z.infer<typeof searchDoctorsSchema>['query'];
export type GetDoctorParams = z.infer<typeof getDoctorSchema>['params'];
export type CreateDoctorInput = z.infer<typeof createDoctorSchema>['body'];
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>['body'];
export type UpdateDoctorParams = z.infer<typeof updateDoctorSchema>['params'];
export type GetAvailableSlotsParams = z.infer<typeof getAvailableSlotsSchema>['params'];
export type GetAvailableSlotsQuery = z.infer<typeof getAvailableSlotsSchema>['query'];
//# sourceMappingURL=doctor.validation.d.ts.map