import { getAllCategories, createCategory } from '../services/categories.service.js';
import { createCategorySchema } from '../validators/category.validator.js';

export const listCategories = async (req, res) => {
    try {
        const categories = await getAllCategories();
        res.status(200).json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

export const addCategory = async (req, res) => {
    const parseResult = createCategorySchema.safeParse(req.body);

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
        const category = await createCategory(parseResult.data);
        res.status(201).json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create category' });
    }
};