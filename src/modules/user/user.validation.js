import Joi from "joi";
import { commonValidations, validationObjectIdFn } from "../../middleware/validation.middleware.js";

export const profilePicSchema = {
  file: Joi.object()
    .keys({
      fieldname: Joi.string().required(),
      originalname: Joi.string().required(),
      encoding: Joi.string().required(),
      mimetype: Joi.string().required(),
      finalPath: Joi.string().required(),
      destination: Joi.string().required(),
      filename: Joi.string().required(),
      path: Joi.string().required(),
      size: Joi.number().required(),
    })
    .required(),
};
export const coverPicsSchema = {
  files: Joi.array()
    .items(
      Joi.object()
        .keys({
          fieldname: Joi.string().required(),
          originalname: Joi.string().required(),
          encoding: Joi.string().required(),
          mimetype: Joi.string().required(),
          finalPath: Joi.string().required(),
          destination: Joi.string().required(),
          filename: Joi.string().required(),
          path: Joi.string().required(),
          size: Joi.number().required(),
        })
    )
    .required(),
};

export const getAnotherUserProfileSchema={
  params:Joi.object().keys({
    profileId:Joi.string().custom(validationObjectIdFn).required()
  }).required()

}
export const updatePasswordSchema={
   body: Joi.object().keys({
    oldPassword: commonValidations.password.required(),
    newPassword: commonValidations.password.required(),
    confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({
      "any.only": "confirm password must match new password",
    }),
  }).required(),
}