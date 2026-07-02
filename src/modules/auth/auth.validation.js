import Joi from "joi";
import { commonValidations } from "../../middleware/validation.middleware.js";

export const signupSchema = {
  query: Joi.object().keys({
    ln: Joi.string().valid("ar", "en", "fr"),
  }),
  body: Joi.object({
    userName: commonValidations.userName.required(),
    email: commonValidations.email.required(),
    password: commonValidations.password.required(),
    phone: commonValidations.password,
    DOB: commonValidations.DOB,
    gender: commonValidations.gender,
    role: Joi.string(),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
      }),
  }).required(),
};

export const loginSchema = {
  body: Joi.object({
    email: commonValidations.email.required(),
    password: commonValidations.password.required(),
  }).required(),
};
export const confirmEmailSchema = {
  body: Joi.object()
    .keys({
      email: commonValidations.email.required(),
      otp: commonValidations.otp.required(),
    })
    .required(),
};
export const resendConfirmEmailOTPSchema = {
  body: Joi.object()
    .keys({
      email: commonValidations.email.required(),
    })
    .required(),
};
export const resendForgetPasswordOTPSchema = {
  body: Joi.object()
    .keys({
      email: commonValidations.email.required(),
    })
    .required(),
};
export const forgetPasswordOTPSchema = {
  body: Joi.object()
    .keys({
      email: commonValidations.email.required(),
    })
    .required(),
};
export const verifyForgetPasswordOTPSchema = {
  body: Joi.object()
    .keys({
      email: commonValidations.email.required(),
      otp: commonValidations.otp.required(),
    })
    .required(),
};
export const resetPasswordSchema = {
  body: Joi.object()
    .keys({
      email: commonValidations.email.required(),
      otp: commonValidations.otp.required(),
      newPassword: commonValidations.password.required(),
      confirmNewPassword: Joi.string().valid(Joi.ref("newPassword")).messages({
        "any.only": "New passwords do not match",
      }),
    })
    .required(),
};
