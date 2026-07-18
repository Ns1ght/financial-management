import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../services/categories.service.js';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ValidationError, NotFoundError } from '../errors/AppError.js';
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

export const editCategory = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new ValidationError('id must be a number');

    const parseResult = updateCategorySchema.safeParse(req.body);
    if (!parseResult.success) {
        throw new ValidationError(
            'Validation failed',
            parseResult.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message,
            }))
        );
    }

    const category = await updateCategory(id, parseResult.data);
    if (!category) throw new NotFoundError('Category not found');

    res.status(200).json(category);
});

export const removeCategory = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new ValidationError('id must be a number');

    const category = await deleteCategory(id);
    if (!category) throw new NotFoundError('Category not found');

    res.status(200).json({ message: 'Category deleted', category });
});