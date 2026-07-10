import { z } from 'zod';

export const createCategorySchema = z.object({
    name: z.string().trim().min(1, 'name is required'),
    type: z.enum(['income', 'expense'], {
        errorMap: () => ({ message: "type must be 'income' or 'expense'"}),
    }),
});