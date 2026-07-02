import { badRequestException } from "../../common/Responses/responses.js";
import {
  create,
  deleteOne,
  find,
  findById,
  findOne,
} from "../../DB/db.repository.js";
import messageModel from "../../DB/models/message.model.js";
import userModel from "../../DB/models/user.model.js";

export async function sendMessage(receiverId, content, filesData, userId) {
  const receiver = await findById({ model: userModel, id: receiverId });
  if (!receiver) {
    return badRequestException("Receiver not found");
  }
  const message = await create({
    model: messageModel,
    insertData: {
      content,
      attachments: filesData.map((file) => file.finalPath),
      senderId: userId,
      receiverId,
    },
  });
  return message;
}
export async function getMessageById(messageId, userData) {
  const message = await findOne({
    model: messageModel,
    filters: {
      _id: messageId,
      $or: [{ senderId: userData?._id }, { receiverId: userData?._id }],
    },
    select: "-senderId",
  });
  if (!message) {
    return badRequestException("Message not found");
  }
  return message;
}
export async function getAllMessages(userId) {
  const messages = await find({
    model: messageModel,
    filters: {
      $or: [{ senderId: userId }, { receiverId: userId }],
    },
    select: "-senderId",
  });
  if (!messages) {
    return badRequestException("Message not found");
  }
  return messages;
}
export async function removeMessage(userId, messageId) {
  const message = await deleteOne({
    model: messageModel,
    filters: { _id: messageId, receiverId: userId },
  });
//   console.log(message.deletedCount);
  
if (!message.deletedCount) {
  throw badRequestException("Failed to delete message");
}
  return { message: "Message deleted successfully" };
}
