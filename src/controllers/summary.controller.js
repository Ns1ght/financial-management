import { getMonthlySummary, getCategorySummary } from '../services/summary.service.js';
import { monthQuerySchema } from '../validators/summary.validator.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ValidationError } from '../errors/AppError.js';

export const monthlySummary = asyncHandler(async (req, res) => {
    const parseResult = monthQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
        throw new ValidationError(
            'Invalid query parameters', 
            parseResult.error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message }))
        );
    }

    const summary = await getMonthlySummary(parseResult.data.month);
    res.status(200).json(summary);
});

export const categorySummary = asyncHandler(async (req, res) => {
    const parseResult = monthQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    throw new ValidationError(
      'Invalid query parameters',
      parseResult.error.issues.map(issue => ({ field: issue.path.join('.'), message: issue.message }))
    );
  }

  const summary = await getCategorySummary(parseResult.data.month);
  res.status(200).json(summary);
})