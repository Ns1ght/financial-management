import { parse } from 'dotenv';
import { getAllTransactions, createTransaction } from '../services/transactions.service.js';
import { createTransactionSchema } from '../validators/transaction.validator.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ValidationError } from '../errors/AppError.js';

export const listTransactions = asyncHandler(async (req, res) => {
    const transactions = await getAllTransactions();
    res.status(200).json(transactions);
});

export const addTransaction = asyncHandler(async (req, res)  => {
    const parseResult = createTransactionSchema.safeParse(req.body);

    if (!parseResult.success) {
        throw new ValidationError(
            'Validation Failed',
            parseResult.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message,
            }))
        );
    }

    const transaction = await createTransaction(parseResult.data);
    res.status(201).json(transaction);
});