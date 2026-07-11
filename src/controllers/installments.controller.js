import { createInstallmentPurchase } from '../services/installments.service.js';
import { createInstallmentSchema } from '../validators/installment.validator.js';

export const addInstallmentPurchase = async (req, res) => {
    const parseResult = createInstallmentSchema.safeParse(req.body);

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
        const result = await createInstallmentPurchase(parseResult.data);
        res.status(201).json(result);
    } catch (err) {
        if (err.code === '23503') {
            return res.status(400).json({
                error: 'Invalid category_id: category does not exist',
            });
        }
        console.error(err);
        res.status(500).json({ error: 'Failed to create installment purchase' });    
    }
};