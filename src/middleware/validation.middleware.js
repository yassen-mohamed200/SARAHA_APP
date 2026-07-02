import Joi from "joi";
import { badRequestException } from "../common/Responses/responses.js";
import { genderEnum } from "../common/enums/user.enums.js";
import { Types } from "mongoose";

export const validation = (schema) => {
  return (req, res, next) => {
    // console.log(Object.keys(schema));
    const validationErrors = [];
    for (const schemaKey of Object.keys(schema)) {
      const validateResult = schema[schemaKey].validate(req[schemaKey], {
        abortEarly: false,
        allowUnknown: false,
      });
      // console.log({
      //   validateValue: validateResult.value,
      //   validateResult,
      //   value: req[schemaKey],
      //   schemaKey,
      // });
      req["v" + schemaKey] = validateResult.value;
      if (validateResult.error?.details?.length > 0) {
        validationErrors.push(...validateResult.error.details);
      }
    }
    if (validationErrors.length > 0) {
      throw badRequestException("validation error", validationErrors);
    }

    next();
  };
};

export const commonValidations = {
  userName: Joi.string()
    .messages({
      "string.length": "length error",
    })
    .pattern(new RegExp(/^[A-Z]{1}[a-z]{1,24}\s[A-Z]{1}[a-z]{1,24}$/)),
  email: Joi.string()
    .trim()
    .email({ tlds: { allow: ["com", "net"] }, maxDomainSegments: 2 })
    .pattern(
      new RegExp(
        /^[a-zA-Z0-9]{3,15}@(gmail|yahoo|icloud)(.com|.net|.edu){1,4}$/,
      ),
    ),
  phone: Joi.string().pattern(new RegExp(/^(\+201|00201|01)(0|1|2|5)\d{8}$/)),
  password: Joi.string()
    .min(4)
    .max(18)
    .pattern(new RegExp(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).{1,18}/)),
  DOB: Joi.date(),
  gender: Joi.string()
    .valid(...Object.values(genderEnum))
    .insensitive()
    .default(genderEnum.MALE),
  otp: Joi.string()
    .length(6)
    .pattern(new RegExp(/^\d{6}$/)),
  id: Joi.string().custom(validationObjectIdFn),
};

export function validationObjectIdFn(value, helpers) {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.message("invalid object id format");
  }
}
