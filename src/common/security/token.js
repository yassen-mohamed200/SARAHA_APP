import {
  TOKEN_SIGNATURE_ADMIN_ACCESS,
  TOKEN_SIGNATURE_ADMIN_REFRESH,
  TOKEN_SIGNATURE_USER_ACCESS,
  TOKEN_SIGNATURE_USER_REFRESH,
} from "../../../config/config.service.js";
import { tokenType } from "../enums/token.enums.js";
import { roleEnum } from "../enums/user.enums.js";
import jwt from "jsonwebtoken";
import {randomUUID} from "crypto"
export const getSignature = (userRole) => {
  let accessSignature = "";
  let refreshSignature = "";
  switch (userRole) {
    case roleEnum.USER:
      accessSignature = TOKEN_SIGNATURE_USER_ACCESS;
      refreshSignature = TOKEN_SIGNATURE_USER_REFRESH;
      break;

    case roleEnum.ADMIN:
      accessSignature = TOKEN_SIGNATURE_ADMIN_ACCESS;
      refreshSignature = TOKEN_SIGNATURE_ADMIN_REFRESH;
      break;
  }
  return { accessSignature, refreshSignature };
};
export const generateToken = ({ payload = {}, signature, options = {} }) => {
  return jwt.sign(payload, signature, options);
};
export const verifyToken = ({ token, signature }) => {
  return jwt.verify(token, signature);
};
export const decodeToken = (token) => {
  return jwt.decode(token);
};
export const generateAccessAndRefreshToken=(user)=>{
  const { accessSignature, refreshSignature } = getSignature(user.role);
  const tokenId = randomUUID();
  const accessToken = generateToken({
    payload: {jti: tokenId },
    signature: accessSignature,
    options: {
      expiresIn: 60 * 30,
      subject: user._id.toString(),
      audience: [user.role, tokenType.ACCESS],
    },
  });
  const refreshToken = generateToken({
    payload: {jti: tokenId },
    signature: refreshSignature,
    options: {
      expiresIn: 60 * 60 * 24 * 30,
      subject: user._id.toString(),
      audience: [user.role, tokenType.REFRESH],
    },
  });
  return {accessToken, refreshToken};
}
