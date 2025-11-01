import { z } from 'zod';
export declare const getAgentSchema: z.ZodObject<{
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
export declare const updateAgentSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        companyName: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        companyName?: string | undefined;
        phone?: string | undefined;
        address?: string | undefined;
    }, {
        name?: string | undefined;
        companyName?: string | undefined;
        phone?: string | undefined;
        address?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name?: string | undefined;
        companyName?: string | undefined;
        phone?: string | undefined;
        address?: string | undefined;
    };
    params: {
        id: string;
    };
}, {
    body: {
        name?: string | undefined;
        companyName?: string | undefined;
        phone?: string | undefined;
        address?: string | undefined;
    };
    params: {
        id: string;
    };
}>;
export declare const listAgentsSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        limit: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        search: z.ZodOptional<z.ZodString>;
        isActive: z.ZodEffects<z.ZodOptional<z.ZodString>, boolean | undefined, string | undefined>;
        sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["name", "companyName", "createdAt"]>>>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        page: number;
        sortBy: "name" | "companyName" | "createdAt";
        sortOrder: "asc" | "desc";
        search?: string | undefined;
        isActive?: boolean | undefined;
    }, {
        limit?: string | undefined;
        search?: string | undefined;
        isActive?: string | undefined;
        page?: string | undefined;
        sortBy?: "name" | "companyName" | "createdAt" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        limit: number;
        page: number;
        sortBy: "name" | "companyName" | "createdAt";
        sortOrder: "asc" | "desc";
        search?: string | undefined;
        isActive?: boolean | undefined;
    };
}, {
    query: {
        limit?: string | undefined;
        search?: string | undefined;
        isActive?: string | undefined;
        page?: string | undefined;
        sortBy?: "name" | "companyName" | "createdAt" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    };
}>;
export type GetAgentParams = z.infer<typeof getAgentSchema>['params'];
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>['body'];
export type UpdateAgentParams = z.infer<typeof updateAgentSchema>['params'];
export type ListAgentsQuery = z.infer<typeof listAgentsSchema>['query'];
//# sourceMappingURL=agent.validation.d.ts.map