import bcrypt from "bcryptjs";
import { SALT_ROUNDS } from "../../../config/config.service.js";
// import { SALT_ROUNDS } from "../../config/config.service.js";

export async function hashValue({ plainText, saltRounds = SALT_ROUNDS }) {
  const hashedValue = await bcrypt.hash(plainText, saltRounds);
  return hashedValue;
}
export async function compareValue({ plainText, hashedValue }) {
  const isMatch = await bcrypt.compare(plainText, hashedValue);
  return isMatch;
}
