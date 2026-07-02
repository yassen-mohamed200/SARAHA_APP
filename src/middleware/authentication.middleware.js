import { tokenType } from "../common/enums/token.enums.js";
import {
  badRequestException,
  unAuthorizedException,
} from "../common/Responses/responses.js";
import {
  decodeToken,
  getSignature,
  verifyToken,
} from "../common/security/token.js";
import { findById } from "../DB/db.repository.js";
import userModel from "../DB/models/user.model.js";
import * as redisService from "../DB/redis.service.js";
export const authentication = (TokenTypeParams = tokenType.ACCESS) => {
  return async (req, res, next) => {
    try {
      const { authorization } = req.headers;
      const [bearerKey, token] = authorization.split(" ");
      if (bearerKey !== "Bearer") {
        return badRequestException("invalid bearer key");
      }
      const decodedToken = decodeToken(token);
      // console.log(decodedToken.aud);

      const [userRole, TokenType] = decodedToken.aud;
      if (TokenType != TokenTypeParams) {
        badRequestException("invalid token type");
      }
      const { accessSignature, refreshSignature } = getSignature(userRole);
      // console.log({accessSignature});

      const verifiedToken = verifyToken({
        token: token,
        signature:
          TokenType == tokenType.ACCESS ? accessSignature : refreshSignature,
      });
      if (
        await redisService.get(
          redisService.blacklistTokenKey({
            userId: verifiedToken.sub,
            tokenData: verifiedToken.jti,
          }),
        )
      ) {
        return unAuthorizedException("you need to login again");
      }
      const user = await findById({
        model: userModel,
        id: verifiedToken.sub,
      });
      if (!user) {
        return unAuthorizedException("Account not found , signup again");
      }
      if (verifiedToken.iat * 1000 < user.changeCreditTime) {
        return unAuthorizedException("you need to login again");
      }
      req.user = user;
      req.tokenPayload = verifiedToken;
      next();
      return user;
    } catch (error) {
      next(error);
    }
  };
};
