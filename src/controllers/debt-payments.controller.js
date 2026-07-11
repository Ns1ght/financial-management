import { processDebtPayment } from '../services/debt-payments.service.js';
import { createDebtPaymentSchema } from '../validators/debt-payment.validator.js';

export const addDebtPayment = async (req, res) => {
    const parseResult = createDebtPaymentSchema.safeParse(req.body);

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
        const result = await processDebtPayment(parseResult.data);
        res.status(201).json(result);
    } catch (err) {
        // Debt group not found (thrown explicitly in the service)
        if (err.message.includes('not found')) {
            return res.status(404).json({ error: err.message});            
        }
        
        // No active sub-debts left (debt fully paid off)
        if (err.message.includes('No active sub-debts remaining')) {
            return res.status(409).json({ error: err.message });
        }

        console.error(err);
        res.status(500).json({ error: 'Failed to process debt payment' });
    };
}