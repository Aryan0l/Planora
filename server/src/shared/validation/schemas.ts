import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const taskSchema = Joi.object({
  day: Joi.number().integer().min(1).required(),
  title: Joi.string().min(1).required(),
  description: Joi.string().allow('').required(),
});

const normalizePlanPayload = (value: Record<string, unknown>) => {
  if (!value.subject && typeof value.category === 'string') {
    value.subject = value.category;
  }

  delete value.category;
  return value;
};

export const planSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(10).required(),
  subject: Joi.string().min(2).max(100),
  category: Joi.string().min(2).max(100),
  durationDays: Joi.number().integer().min(1).required(),
  tasks: Joi.array().items(taskSchema).min(1).required(),
})
  .or('subject', 'category')
  .custom(normalizePlanPayload);

export const planUpdateSchema = Joi.object({
  title: Joi.string().min(5).max(200),
  description: Joi.string().min(10),
  subject: Joi.string().min(2).max(100),
  category: Joi.string().min(2).max(100),
  durationDays: Joi.number().integer().min(1),
  tasks: Joi.array().items(taskSchema).min(1),
}).custom(normalizePlanPayload);

export const progressSchema = Joi.object({
  completedTaskIds: Joi.array().items(Joi.number().integer().positive()).required(),
});

export const ratingSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
});
