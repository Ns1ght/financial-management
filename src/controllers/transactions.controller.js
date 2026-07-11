import { parse } from 'dotenv';
import { getAllTransactions, createTransaction } from '../services/transactions.service.js';
import { createTransactionSchema } from '../validators/transaction.validator.js';

export const listTransactions = async (req, res) => {
    try {
        const transactions = await getAllTransactions();
        res.status(200).json(transactions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch transactions '});
    }
};

export const addTransaction = async (req, res) => {
    const parseResult = createTransactionSchema.safeParse(req.body);

    if (!parseResult.success) {
        return res.status(400).json({
            error: 'Validation failed',
            details: parseResult.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message,
            })),
        });
    }

    try {
        const transaction = await createTransaction(parseResult.data);
        res.status(201).json(transaction);
    } catch (err) {
        // Postgres FK violation error code
        if (err.code === '23503') {
            return res.status(400).json({
                error: 'Invalid category_id: category does not exist',
            });            
        }
        console.error(err);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
};