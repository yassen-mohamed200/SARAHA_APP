import { SECRET_KEY, WEB_CLIENT_ID } from "../../../config/config.service.js";
import {
  badRequestException,
  conflictException,
} from "../../common/Responses/responses.js";
import { create, findOne, updateOne } from "../../DB/db.repository.js";
import userModel from "../../DB/models/user.model.js";
import { compareValue, hashValue } from "../../common/security/hash.js";
import { decryptValue, encryptValue } from "../../common/security/encrypt.js";
import { generateAccessAndRefreshToken } from "../../common/security/token.js";
import { OAuth2Client } from "google-auth-library";
import { providerEnum } from "../../common/enums/user.enums.js";
import { generateOTP } from "../../common/OTP/otp.service.js";
import sendMail from "../../common/email/email.config.js";
import { emailEnum } from "../../common/enums/email.enum.js";
import * as redisService from "../../DB/redis.service.js";
async function sendMailOTP({ email, emailType, subject }) {
  const prevOTP = await redisService.ttl(
    redisService.getOTPKey({ email, emailType }),
  );
  if (prevOTP > 0) {
    return badRequestException(
      `Please wait ${prevOTP} seconds before requesting a new OTP`,
    );
  }
  const isBlocked = await redisService.exists(
    redisService.getOTPBlockedKey({ email, emailType }),
  );
  if (isBlocked) {
    return badRequestException(
      `try again later, you have requested more than 5 OTPs in a short time`,
    );
  }
  const requestCount = await redisService.get(
    redisService.getOTPNoReqKey({ email, emailType }),
  );
  if (requestCount == 5) {
    await redisService.set({
      key: redisService.getOTPBlockedKey({ email, emailType }),
      value: 1,
      exValue: 60 * 10,
    });
    return badRequestException(
      `you can not request more than 5 OTPs, please try again after 10 minutes`,
    );
  }
  const otp = generateOTP();
  await sendMail({
    to: email,
    subject: subject,
    text: "Your OTP is: " + otp,
    html: `<h1>Confirm Your Email</h1> <h2>Your OTP is: ${otp}</h2>`,
  });
  await redisService.set({
    key: redisService.getOTPKey({ email, emailType }),
    value: await hashValue({ plainText: otp }),
    exValue: 120,
  });
  await redisService.incr(redisService.getOTPNoReqKey({ email, emailType }));
  return { message: "check in your inbox for the OTP" };
}
export async function signup(bodyData) {
  const { email } = bodyData;
  const isEmail = await findOne({ model: userModel, filters: { email } });
  if (isEmail) {
    return conflictException("email already exists");
  }
  bodyData.password = await hashValue({ plainText: bodyData.password });
  bodyData.phone = encryptValue({
    plainText: bodyData.phone,
    secretKey: SECRET_KEY,
  });
  const user = await create({ model: userModel, insertData: bodyData });
  await sendMailOTP({
    email,
    emailType: emailEnum.CONFIRM_EMAIL,
    subject: "Confirm Your Email",
  });
  return user;
}
export async function confirmEmail(bodyData) {
  const { email, otp } = bodyData;
  const user = await findOne({
    model: userModel,
    filters: { email, confirmEmail: false },
  });
  if (!user) {
    return badRequestException("invalid email or email already confirmed");
  }
  const storedOTP = await redisService.get(
    redisService.getOTPKey({ email, emailType: emailEnum.CONFIRM_EMAIL }),
  );
  if (!storedOTP) {
    return badRequestException("OTP expired, please request a new one");
  }
  const isMatchedOTP = await compareValue({
    plainText: otp,
    hashedValue: storedOTP,
  });
  if (!isMatchedOTP) {
    return badRequestException("invalid OTP");
  }
  user.confirmEmail = true;
  await user.save();
  return { message: "Email confirmed successfully" };
}
export async function resendOTP(bodyData) {
  const { email } = bodyData;
  await sendMailOTP({
    email,
    emailType: emailEnum.CONFIRM_EMAIL,
    subject: "Resend OTP to Confirm Your Email",
  });
}
export async function sendForgetPasswordOTP(bodyData) {
  const { email } = bodyData;
  const user = await findOne({
    model: userModel,
    filters: { email },
  });
  if (!user) {
    return;
  }
  if (!user.confirmEmail) {
    return badRequestException("please confirm your email first");
  }
  await sendMailOTP({
    email,
    emailType: emailEnum.FORGET_PASSWORD,
    subject: "Forget Password OTP",
  });
}
export async function verifyForgetPasswordOTP(bodyData) {
  const { email, otp } = bodyData;
  const emailOTP = await redisService.get(
    redisService.getOTPKey({ email, emailType: emailEnum.FORGET_PASSWORD }),
  );
  if (!emailOTP) {
    return badRequestException("expired OTP");
  }
  const isMatch = await compareValue({ plainText: otp, hashedValue: emailOTP });
  if (!isMatch) {
    return badRequestException("invalid OTP");
  }
}
export async function resetPassword(bodyData) {
  const { email, otp, newPassword } = bodyData;
  await verifyForgetPasswordOTP({ email, otp });
  await updateOne({
    model: userModel,
    filters: { email },
    data: { password: await hashValue({ plainText: newPassword }) },
  });
  return { message: "password reset successfully" };
}
export async function resendOTPForgetPassword(bodyData) {
  const {email}=bodyData;
  await sendMailOTP({
    email,
    emailType:emailEnum.FORGET_PASSWORD,
    subject:"Another OTP to reset your password"
  })
}
export async function login(bodyData) {
  const { email, password } = bodyData;
  const user = await findOne({ model: userModel, filters: { email } });
  if (!user) {
    return conflictException("invalid email or password");
  }
  if (!user.confirmEmail) {
    return badRequestException("please confirm your email first");
  }
  const isPassword = await compareValue({
    plainText: password,
    hashedValue: user.password,
  });
  if (!isPassword) {
    return conflictException("invalid email or password");
  }
  user.phone = decryptValue({
    encryptedText: user.phone,
    secretKey: SECRET_KEY,
  });
  const { accessToken, refreshToken } = generateAccessAndRefreshToken(user);

  return { user, accessToken, refreshToken };
}
async function verifyGoogleToken({ token }) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: WEB_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return payload;
}
export async function signupGmail(bodyData) {
  const { idToken } = bodyData;
  const payload = await verifyGoogleToken({ token: idToken });
  // console.log({payload});
  if (!payload.email_verified) {
    return badRequestException("email not verified");
  }
  const user = await findOne({
    model: userModel,
    filters: {
      email: payload.email,
    },
  });
  if (user) {
    if (user.provider === providerEnum.SYSTEM) {
      return conflictException(
        "account with this email already exists,please login",
      );
    }
    return { statuscode: 200, result: await loginGmail({ idToken }) };
  }
  const newUser = await create({
    model: userModel,
    insertData: {
      email: payload.email,
      userName: payload.name,
      profilePic: payload.picture,
      provider: providerEnum.GOOGLE,
      confirmEmail: true,
    },
  });
  const { accessToken, refreshToken } = generateAccessAndRefreshToken(newUser);

  return { statuscode: 201, result: { newUser, accessToken, refreshToken } };
}
export async function loginGmail(bodyData) {
  const { idToken } = bodyData;
  const payload = await verifyGoogleToken({ token: idToken });
  if (!payload.email_verified) {
    return badRequestException("email not verified");
  }
  const user = await findOne({
    model: userModel,
    filters: {
      email: payload.email,
      provider: providerEnum.GOOGLE,
    },
  });
  if (!user) {
    return signupGmail({ idToken });
  }
  const { accessToken, refreshToken } = generateAccessAndRefreshToken(user);
  return { statuscode: 200, result: { user, accessToken, refreshToken } };
}
