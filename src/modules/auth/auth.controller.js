import { Router } from "express";
import {
  confirmEmail,
  login,
  resendOTP,
  resendOTPForgetPassword,
  resetPassword,
  sendForgetPasswordOTP,
  signup,
  signupGmail,
  verifyForgetPasswordOTP,
} from "./auth.service.js";
import { successResponse } from "../../common/Responses/responses.js";
import { validation } from "../../middleware/validation.middleware.js";
import {
  confirmEmailSchema,
  forgetPasswordOTPSchema,
  loginSchema,
  resendConfirmEmailOTPSchema,
  resendForgetPasswordOTPSchema,
  resetPasswordSchema,
  signupSchema,
  verifyForgetPasswordOTPSchema,
} from "./auth.validation.js";
//import service
const authRouter = Router();

authRouter.get("/", (req, res) => {
  res.send("auth page");
});
authRouter.post("/signup", validation(signupSchema), async (req, res) => {
  try {
    // console.log({body:req.body,vBody:req.vbody});
    const result = await signup(req.vbody);
    return successResponse(res, result, 201);
  } catch (error) {
    throw error;
  }
});
authRouter.post(
  "/confirmEmail",
  validation(confirmEmailSchema),
  async (req, res) => {
    try {
      const result = await confirmEmail(req.vbody);
      return successResponse(res, result, 201);
    } catch (error) {
      throw error;
    }
  },
);
authRouter.post(
  "/resendOTP",
  validation(resendConfirmEmailOTPSchema),
  async (req, res) => {
    try {
      const result = await resendOTP(req.vbody);
      return successResponse(res, result, 201);
    } catch (error) {
      throw error;
    }
  },
);
authRouter.post(
  "/forgetPasswordOTP",
  validation(forgetPasswordOTPSchema),
  async (req, res) => {
    try {
      const result = await sendForgetPasswordOTP(req.vbody);
      return successResponse(res, result, 201);
    } catch (error) {
      throw error;
    }
  },
);
authRouter.post(
  "/verifyForgetPasswordOTP",
  validation(verifyForgetPasswordOTPSchema),
  async (req, res) => {
    try {
      const result = await verifyForgetPasswordOTP(req.vbody);
      return successResponse(res, result, 201);
    } catch (error) {
      throw error;
    }
  },
);
authRouter.post(
  "/resetPassword",
  validation(resetPasswordSchema),
  async (req, res) => {
    try {
      const result = await resetPassword(req.vbody);
      return successResponse(res, result, 201);
    } catch (error) {
      throw error;
    }
  },
);
authRouter.post(
  "/resendForgetPasswordOTP",
  validation(resendForgetPasswordOTPSchema),
  async (req, res) => {
    try {
      const result = await resendOTPForgetPassword(req.vbody);
      return successResponse(res, result, 201);
    } catch (error) {
      throw error;
    }
  },
);
authRouter.post("/signup/gmail", async (req, res) => {
  try {
    const result = await signupGmail(req.body);
    return successResponse(res, result, result.statuscode);
  } catch (error) {
    throw error;
  }
});
authRouter.post("/login", validation(loginSchema), async (req, res) => {
  try {
    const result = await login(req.vbody);
    return successResponse(res, result, 201);
  } catch (error) {
    throw error;
  }
});
export default authRouter;
