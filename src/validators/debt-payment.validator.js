import { z } from 'zod';

export const createDebtPaymentSchema = z.object({
    debt_group_id: z.number().int().positive('debt_group_id must be a positive integer'),
    payment_date: z.string().refine(
        (val) => !isNaN(Date.parse(val)),
        { message: 'payment_date must be a valid date (e.g. YYYY-MM-DD' }
    ),
});