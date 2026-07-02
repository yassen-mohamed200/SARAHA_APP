import mongoose from "mongoose";
import {
  genderEnum,
  providerEnum,
  roleEnum,
} from "../../common/enums/user.enums.js";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return this.provider === providerEnum.SYSTEM;
      },
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: Object.values(genderEnum),
      default: genderEnum.MALE,
    },
    phone: String,
    DOB: {
      type: Date,
    },
    role: {
      type: String,
      enum: Object.values(roleEnum),
      default: roleEnum.USER,
    },
    provider: {
      type: String,
      enum: Object.values(providerEnum),
      default: providerEnum.SYSTEM,
    },
    profilePic: String,
    coverPics: [String],
    changeCreditTime: Date,
  },
  {
    timestamps: true,
  },
);
const userModel = mongoose.model("User", userSchema);
export default userModel;
