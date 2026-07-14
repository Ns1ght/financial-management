import { processDebtPayment } from '../services/debt-payments.service.js';
import { createDebtPaymentSchema } from '../validators/debt-payment.validator.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ValidationError } from '../errors/AppError.js';

export const addDebtPayment = asyncHandler(async (req, res) => {
  const parseResult = createDebtPaymentSchema.safeParse(req.body);

  if (!parseResult.success) {
    throw new ValidationError(
      'Validation failed',
      parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
    );
  }

  const result = await processDebtPayment(parseResult.data);
  res.status(201).json(result);
});