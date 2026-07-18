import { AppError } from "../errors/AppError.js";

export const errorHandler = (err, req, res, next) => {
    // Custom errors (NotFoundError, ConflictError, ValidationError)
    if (err instanceof AppError) {
        const response = { error: err.message };
        if (err.details) {
            response.details = err.details;
        }
        return res.status(err.statusCode).json(response);
    }

    // Postgres FK violation
    if (err.code === '23503') {
        if (req.method === 'DELETE') {
            return res.status(409).json({
                error: 'Cannot delete: this resource is still referenced by other records',
            });
        }
        return res.status(400).json({ error: 'Referenced resource does not exist' });
    }

    // Postgres unique constraint violation
    if (err.code === '23505') {
        return res.status(409).json({ error: 'Resource already exists'});
    }

    // Anything else
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
};