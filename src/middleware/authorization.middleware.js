import { roleEnum } from "../common/enums/user.enums.js";
import { forbiddenException } from "../common/Responses/responses.js";

export const authorization = (roles = [roleEnum.USER]) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        return forbiddenException("do not have permission to access this API");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
