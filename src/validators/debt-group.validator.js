import { z } from 'zod';

export const createDebtGroupSchema = z.object({
    name: z.string().trim().min(1, 'name is required'),
    monthly_payment_amount: z.number().positive('monthly_payment_amount must be a positive number'),
    category_id: z.number().int().positive('category_id must be a positive integer'),
    sub_debts: z.array(
        z.object({
            name: z.string().trim().min(1, 'sub_debt name is required'),
            original_amount: z.number().positive('sub_debt original_amount must be a positive number'),
        })
    ).min(1, 'at least one sub_debt is required'),
});