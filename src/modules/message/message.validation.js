import Joi from "joi";
import { commonValidations } from "../../middleware/validation.middleware.js";
export const sendMessageSchema = {
  body: Joi.object({})
    .keys({
      content: Joi.string().min(3).max(1000),
    })
    .required(),
  params: Joi.object()
    .keys({
      receiverId: commonValidations.id.required(),
    })
    .required(),
};
export const getMessageByIdSchema = {
  params: Joi.object()
    .keys({
      messageId: commonValidations.id.required(),
    })
    .required(),
};
