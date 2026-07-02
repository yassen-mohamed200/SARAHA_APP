import { Router } from "express";
import localUpload, {
  allowedFileFormats,
} from "../../common/multer/multer.config.js";
import {
  getAllMessages,
  getMessageById,
  removeMessage,
  sendMessage,
} from "./message.service.js";
import { successResponse } from "../../common/Responses/responses.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { validation } from "../../middleware/validation.middleware.js";
import {
  getMessageByIdSchema,
  sendMessageSchema,
} from "./message.validation.js";

const messageRouter = Router({});

messageRouter.get("/", (req, res) => {
  res.send("Hello from message controller!");
});
messageRouter.post(
  "/send/:receiverId",
  (req, res, next) => {
    const { authorization } = req.headers;
    if (authorization) {
      return authentication()(req, res, next);
      //   const authMiddleware = authentication();
      //   return authMiddleware(req, res, next);
    }
    next();
  },
  localUpload({
    folderName: "messages",
    allowedFormats: [...allowedFileFormats.img, ...allowedFileFormats.video],
    fileSize: 50,
  }).array("msgAttachments", 5),
  validation(sendMessageSchema),
  async (req, res) => {
    const result = await sendMessage(
      req.params.receiverId,
      req.body.content,
      req.files,
      req.user?._id,
    );
    return successResponse(res, result, 201);
  },
);
messageRouter.get(
  "/get-messageById/:messageId",
  authentication(),
  validation(getMessageByIdSchema),
  async (req, res) => {
    const { messageId } = req.params;
    const result = await getMessageById(messageId, req.user);
    return successResponse(res, result, 201);
  },
);
messageRouter.get("/get-all-messages", authentication(), async (req, res) => {
  const result = await getAllMessages(req.user._id);
  return successResponse(res, result, 201);
});
messageRouter.delete(
  "/delete-message/:messageId",
  authentication(),
  async (req, res) => {
    const { messageId } = req.params;
    const result = await removeMessage(req.user._id, messageId);
    // console.log({result});
    return successResponse(res, result, 200);
  },
);
export default messageRouter;
