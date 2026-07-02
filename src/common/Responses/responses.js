import { NODE_ENV } from "../../../config/config.service.js";

export const successResponse = (res, result, statusCode = 200) => {
  res.status(statusCode).json({ message: "success", result });
};
export const globalErrorHandling = (err, req, res, next) => {
  return NODE_ENV == "dev"
    ? res
        .status(err.cause?.statusCode ?? 500)
        .json({
          errMessage: err.message,
          err,
          stack: err.stack,
          extra: err.cause?.extra,
        })
    : res.status(err.cause?.statusCode ?? 500).json({
        errMessage: err.message,
        err,
        stack: err.stack,
        extra: err.cause?.extra,
      });
};

export const notFoundException = (msg) => {
  throw new Error(msg, { cause: { statusCode: 404 } });
};
export const badRequestException = (msg, extra=null) => {
  const error = new Error(msg, { cause: { statusCode: 400 } });
  error.extra = extra;
  return error;
};
export const conflictException = (msg) => {
  throw new Error(msg, { cause: { statusCode: 409 } });
};
export const unAuthorizedException = (msg) => {
  throw new Error(msg, { cause: { statusCode: 401 } });
};
export const forbiddenException = (msg) => {
  throw new Error(msg, { cause: { statusCode: 403 } });
};
