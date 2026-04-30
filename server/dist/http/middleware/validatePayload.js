"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const validateBody = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                details: error.details.map((detail) => detail.message),
            });
        }
        req.body = value;
        next();
    };
};
exports.validateBody = validateBody;
