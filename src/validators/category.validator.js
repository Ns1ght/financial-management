import { z } from 'zod';

export const createCategorySchema = z.object({
    name: z.string().trim().min(1, 'name is required'),
    type: z.enum(['income', 'expense'], {
        errorMap: () => ({ message: "type must be 'income' or 'expense'"}),
    }),
});

export const updateCategorySchema = z.object({
    name: z.string().trim().min(1).optional(),
    type: z.enum(['income', 'expense']).optional(),
}).refine(
    (data) => data.name !== undefined || data.type !== undefined,
    { message: 'At least one field (name or type) must be provided' }
);