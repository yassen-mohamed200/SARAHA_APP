import { SECRET_KEY } from "../../../config/config.service.js";
import { tokenType } from "../../common/enums/token.enums.js";
import { badRequestException } from "../../common/Responses/responses.js";
import { decryptValue } from "../../common/security/encrypt.js";
import { compareValue, hashValue } from "../../common/security/hash.js";
import { generateToken, getSignature } from "../../common/security/token.js";
import { findById, updateOne } from "../../DB/db.repository.js";
import userModel from "../../DB/models/user.model.js";
import * as redisService from "../../DB/redis.service.js";

export const getUserProfile = async (userData) => {
  try {
    return userData;
  } catch (error) {
    throw error;
  }
};
export const renewToken = async (userData) => {
  console.log({ userData });

  const { accessSignature } = getSignature(userData.role);
  const newAccessToken = generateToken({
    signature: accessSignature,
    options: {
      expiresIn: 60 * 30,
      subject: userData._id.toString(),
      audience: [userData.role, tokenType.ACCESS],
    },
  });
  return { newAccessToken };
};
export const uploadProfilePic = async (userId, file) => {
  updateOne({
    model: userModel,
    filters: { _id: userId._id },
    data: { profilePic: file.finalPath },
  });
};
export const uploadCoverPics = async (userId, files) => {
  const profilePicPath = [];
  for (const file of files) {
    profilePicPath.push(file.finalPath);
  }
  updateOne({
    model: userModel,
    filters: { _id: userId._id },
    data: { profilePic: profilePicPath },
  });
};
export const getAnotherUserProfile = async (profileId) => {
  const user = await findById({
    model: userModel,
    id: profileId,
    select: "-password -confirmEmail -role -updatedAt -createdAt -__v",
  });
  if (user.phone) {
    user.phone = decryptValue({
      encryptedText: user.phone,
      secretKey: SECRET_KEY,
    });
  }
  return user;
};
export const logout = async (userData, tokenData, logoutOptions) => {
  if (logoutOptions === "all") {
    await updateOne({
      model: userModel,
      filters: { _id: userData._id },
      data: {
        changeCreditTime: new Date(),
      },
    });
  } else {
    const key = redisService.blacklistTokenKey({
      userId: userData._id,
      tokenData: tokenData.jti,
    });
    await redisService.set({
      key,
      value: tokenData.jti,
      exValue: Math.max(
        Math.floor(60 * 60 * 24 * 365 - (Date.now() / 1000 - tokenData.iat)),
        1,
      ),
    });
  }
};

export const updatePassword = async (bodyData, userdata) => {
  const { oldPassword, newPassword } = bodyData;

  const isOldPassword = await compareValue({
    plainText: oldPassword,
    hashedValue: userdata.password,
  });
  if (!isOldPassword) {
    return badRequestException("incorrect old password");
  }
  await updateOne({
    model: userModel,
    filters: {
      _id: userdata._id,
    },
    data: {
      password: await hashValue({ plainText: newPassword }),
      changeCreditTime: new Date(),
    },
  });
};
