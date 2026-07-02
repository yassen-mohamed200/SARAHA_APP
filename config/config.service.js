import path from "path";
import dotenv from "dotenv";
export const NODE_ENV = process.env.NODE_ENV || "dev";

const envPath = {
  dev: path.resolve("./config/.env.dev"),
  prod: path.resolve("./config/.env.prod"),
};
dotenv.config({ path: envPath[NODE_ENV] });

export const PORT = process.env.PORT || 3000;
export const DB_URL_LOCAL = process.env.DB_URL_LOCAL || "";
export const DB_URL_ATLAS = process.env.DB_URL_ATLAS || "";
export const REDIS_URL = process.env.REDIS_URL || "";

// export const SALT_ROUNDS = +process.env.SALT_ROUNDS || 10; ==>parseInt
export const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;
export const SECRET_KEY = process.env.SECRET_KEY || "";
export const TOKEN_SIGNATURE_USER_ACCESS =
  process.env.TOKEN_SIGNATURE_USER_ACCESS;
export const TOKEN_SIGNATURE_ADMIN_ACCESS =
  process.env.TOKEN_SIGNATURE_ADMIN_ACCESS;
export const TOKEN_SIGNATURE_USER_REFRESH =
  process.env.TOKEN_SIGNATURE_USER_REFRESH;
export const TOKEN_SIGNATURE_ADMIN_REFRESH =
  process.env.TOKEN_SIGNATURE_ADMIN_REFRESH;
export const WEB_CLIENT_ID = process.env.WEB_CLIENT_ID || "";

export const MAIL_USER = process.env.MAIL_USER;
export const MAIL_PASS = process.env.MAIL_PASS;
