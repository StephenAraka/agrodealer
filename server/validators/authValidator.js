import Joi from "joi";

const phoneNumberRule = Joi.string()
  .trim()
  .pattern(/^[0-9+]{10,15}$/)
  .messages({
    "string.pattern.base": "phone_number must be 10-15 digits and may start with +",
  });

export const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  username: Joi.string().trim().min(3).max(60).required(),
  password: Joi.string().min(6).max(128).required(),
  phone_number: phoneNumberRule.required(),
});

export const verifyPhoneSchema = Joi.object({
  phone_number: phoneNumberRule.required(),
  otp_code: Joi.string().trim().length(6).required(),
});

export const loginSchema = Joi.object({
  username: Joi.string().trim().required(),
  password: Joi.string().required(),
});

export const forgotUsernameRequestSchema = Joi.object({
  phone_number: phoneNumberRule.required(),
});

export const forgotUsernameVerifySchema = Joi.object({
  phone_number: phoneNumberRule.required(),
  otp_code: Joi.string().trim().length(6).required(),
});

export const forgotPasswordRequestSchema = Joi.object({
  username: Joi.string().trim().required(),
  phone_number: phoneNumberRule.required(),
});

export const forgotPasswordResetSchema = Joi.object({
  username: Joi.string().trim().required(),
  phone_number: phoneNumberRule.required(),
  otp_code: Joi.string().trim().length(6).required(),
  new_password: Joi.string().min(6).max(128).required(),
});
