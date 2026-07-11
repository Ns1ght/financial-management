import { z } from 'zod';

export const createInstallmentSchema = z.object({
    description: z.string().trim().min(1, 'description is required'),
    total_amount: z.number().positive('total_amount must be a positive number'),
    installment_count: z.number().int().min(2, 'installment_count must be at least 2'),
    first_due_date: z.string().refine(
        (val) => !isNaN(Date.parse(val)),
        { message: 'first_due_datge must be a valid date (e.g YYYY-MM-DD' }
    ),
    category_id: z.number().int().positive('category_id must be a positive integer'),
});