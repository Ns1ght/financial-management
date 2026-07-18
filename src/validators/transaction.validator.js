import { z } from 'zod';

export const createTransactionSchema = z.object({
    description: z.string().trim().min(1, 'description is required'),
    amount: z.number().positive('amount must be a positive number'),
    type: z.enum(['income', 'expense'], {
        errorMap: () => ({ message: "type must be 'income' or 'expense'"}),
    }),
    date: z.string().refine(
        (val) => !isNaN(Date.parse(val)),
        { message: 'date must be a valid date (e.g. YYYY-MM-DD' }
    ),
    category_id: z.number().int().positive('category_id must be a positive integer'),
});

export const updateTransactionSchema = z.object({
  description: z.string().trim().min(1).optional(),
  amount: z.number().positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'date must be a valid date (e.g. YYYY-MM-DD)',
  }).optional(),
  category_id: z.number().int().positive().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' }
);