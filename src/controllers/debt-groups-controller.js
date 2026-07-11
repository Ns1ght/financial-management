import { getAllDebtGroups, getDebtGroupById, createDebtGroup } from "../services/debt-groups.service.js";
import { createDebtGroupSchema } from "../validators/debt-group.validator.js";

export const listDebtGroups = async (req, res) => {
    try {
        const groups = await getAllDebtGroups();
        res.status(200).json(groups);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch debt groups' });
    }
};

export const getDebtGroup = async (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
        return res.status(400).json({ error: 'id must be a number' });
    }

    try {
        const group = await getDebtGroupById(id);

        if (!group) {
            return res.status(404).json({ error: 'Debt group not found' });
        }

        res.status(200).json(group);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch debt group' });
    }
};

export const addDebtGroup = async (req, res) => {
    const parseResult = createDebtGroupSchema.safeParse(req.body);

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
        const group = await createDebtGroup(parseResult.data);
        res.status(201).json(group);
    } catch (err) {
        if (err.code === '20503') {
            return res.status(400).json({
                error: 'Invalid category_id: category does not exist',
            });
        }
        console.error(err);
        res.status(500).json({ error: 'Failed to create debt group' });
    }
};