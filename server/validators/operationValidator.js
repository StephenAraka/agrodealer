import Joi from "joi";

export const topupSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required(),
});

export const purchaseSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).required(),
});

export const transactionListQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
});
