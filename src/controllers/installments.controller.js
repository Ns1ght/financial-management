import { createInstallmentPurchase } from '../services/installments.service.js';
import { createInstallmentSchema } from '../validators/installment.validator.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ValidationError } from '../errors/AppError.js';

export const addInstallmentPurchase = asyncHandler(async (req, res) => {
    const parseResult = createInstallmentSchema.safeParse(req.body);

    if (!parseResult.success) {
        throw new ValidationError(
            'Validation failed',
            parseResult.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message,
            }))
        );
    }

    const result = await createInstallmentPurchase(parseResult.data);
    res.status(201).json(result);
});  