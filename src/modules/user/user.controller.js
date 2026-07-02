import { Router } from "express";
import {
  getAnotherUserProfile,
  getUserProfile,
  logout,
  renewToken,
  updatePassword,
  uploadCoverPics,
  uploadProfilePic,
} from "./user.service.js";
import { successResponse } from "../../common/Responses/responses.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { authorization } from "../../middleware/authorization.middleware.js";
import { roleEnum } from "../../common/enums/user.enums.js";
import { tokenType } from "../../common/enums/token.enums.js";
import localUpload, {
  allowedFileFormats,
} from "../../common/multer/multer.config.js";
import { validation } from "../../middleware/validation.middleware.js";
import { coverPicsSchema, getAnotherUserProfileSchema, profilePicSchema, updatePasswordSchema } from "./user.validation.js";

const userRouter = Router();

userRouter.get("/profile", (req, res) => {
  res.json({ message: "user profile" });
});
userRouter.get(
  "/userProfile",
  authentication(),
  authorization([roleEnum.USER]),
  async (req, res) => {
    const result = await getUserProfile(req.user);
    return successResponse(res, result, 201);
  },
);
userRouter.post(
  "/renewToken",
  authentication(tokenType.REFRESH),
  async (req, res) => {
    const result = await renewToken(req.user);
    return successResponse(res, result, 201);
  },
);
userRouter.post(
  "/upload_profilePic",
  authentication(tokenType.ACCESS),
  localUpload({
    folderName: "users",
    allowedFormats: allowedFileFormats.img,
    fileSize:15
  }).single("profilePic"),
  validation(profilePicSchema),
  async (req, res) => {
    // console.log(req.file);
    
    const result = await uploadProfilePic(req.user, req.file);
    return successResponse(res, result, 201);
  },
);
userRouter.post(
  "/uploadCoverPics",
  authentication(tokenType.ACCESS),
  localUpload({
    folderName: "users",
    allowedFormats: allowedFileFormats.img,
    fileSize:15
  }).array("coverPics",5),
  validation(coverPicsSchema),
  async (req, res) => {
    // console.log(req.file);
    
    const result = await uploadCoverPics(req.user, req.files);
    return successResponse(res, result, 201);
  },
);
userRouter.get(
  "/shareProfile/:profileId",
  validation(getAnotherUserProfileSchema),
  async (req, res) => {
    const result = await getAnotherUserProfile(req.params.profileId);
    return successResponse(res, result, 201);
  },
);
userRouter.post(
  "/logout",
  authentication(),
  authorization([roleEnum.USER]),
  async (req, res) => {
    console.log({user:req.user});
    console.log({tokenPayload:req.tokenPayload});
    const result = await logout(req.user, req.tokenPayload,req.body.logoutOption);
    return successResponse(res, result, 201);
  },
);
userRouter.patch(
  "/updatePassword",
  authentication(),
  validation(updatePasswordSchema),
  async (req, res) => {
    console.log({user:req.user});
    console.log({tokenPayload:req.tokenPayload});
    const result = await updatePassword(req.body,req.user)
    return successResponse(res, result, 201);
  },
);
export default userRouter;
