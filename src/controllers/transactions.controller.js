import { getAllTransactions, createTransaction, getTransactionById, updateTransaction,deleteTransaction } from '../services/transactions.service.js';
import { createTransactionSchema, updateTransactionSchema } from '../validators/transaction.validator.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ValidationError, NotFoundError, ConflictError } from '../errors/AppError.js';

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

const assertEditable = (transaction) => {
  if (transaction.installment_purchase_id !== null) {
    throw new ConflictError(
      'This transaction is part of an installment purchase and cannot be edited or deleted directly'
    );
  }
  if (transaction.debt_payment_id !== null) {
    throw new ConflictError(
      'This transaction is part of a debt payment and cannot be edited or deleted directly'
    );
  }
};

export const editTransaction = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw new ValidationError('id must be a number');

  const existing = await getTransactionById(id);
  if (!existing) throw new NotFoundError('Transaction not found');

  assertEditable(existing);

  const parseResult = updateTransactionSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new ValidationError(
      'Validation failed',
      parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
    );
  }

  const transaction = await updateTransaction(id, parseResult.data);
  res.status(200).json(transaction);
});

export const removeTransaction = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw new ValidationError('id must be a number');

  const existing = await getTransactionById(id);
  if (!existing) throw new NotFoundError('Transaction not found');

  assertEditable(existing);

  const transaction = await deleteTransaction(id);
  res.status(200).json({ message: 'Transaction deleted', transaction });
});