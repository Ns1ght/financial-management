import { getAllCategories, createCategory } from '../services/categories.service.js';
import { createCategorySchema } from '../validators/category.validator.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ValidationError } from '../errors/AppError.js';
import { parse } from 'dotenv';

export const listCategories = asyncHandler(async (req, res) => {
    const categories = await getAllCategories();
    res.status(200).json(categories);
});

export const addCategory = asyncHandler(async (req, res) => {
    const parseResult = createCategorySchema.safeParse(req.body);

    if (!parseResult.success) {
        throw new ValidationError(
            'Validation failed',
            parseResult.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message,
            }))
        );
    }

    const category = await createCategory(parseResult.data);
    res.status(201).json(category);
});