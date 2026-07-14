export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Conflict with current state') {
        super(message, 409);
    }
}

export class ValidationError extends AppError {
    constructor(message = 'Validation failed', details = []) {
        super(message, 400);
        this.details = details;
    }
}