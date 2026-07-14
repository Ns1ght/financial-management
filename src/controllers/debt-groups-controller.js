import { getAllDebtGroups, getDebtGroupById, createDebtGroup } from "../services/debt-groups.service.js";
import { createDebtGroupSchema } from "../validators/debt-group.validator.js";
import { asyncHandler } from '../middleware/asyncHandler.js';
import { ValidationError, NotFoundError } from '../errors/AppError.js';

export const listDebtGroups = asyncHandler(async (req, res) => {
  const groups = await getAllDebtGroups();
  res.status(200).json(groups);
});

export const getDebtGroup = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    throw new ValidationError('id must be a number');
  }

  const group = await getDebtGroupById(id);

  if (!group) {
    throw new NotFoundError('Debt group not found');
  }

  res.status(200).json(group);
});

export const addDebtGroup = asyncHandler(async (req, res) => {
  const parseResult = createDebtGroupSchema.safeParse(req.body);

  if (!parseResult.success) {
    throw new ValidationError(
      'Validation failed',
      parseResult.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
    );
  }

  const group = await createDebtGroup(parseResult.data);
  res.status(201).json(group);
});