import { client } from "./redis.connection.js";
export async function set({ key, value, exType = "EX", exValue = 120 }) {
  return await client.set(key, value, {
    expiration: {
      type: exType,
      value: Math.floor(exValue),
    },
  });
}
export async function incr(key) {
  return await client.incr(key);
}
export async function decr(key) {
  return await client.decr(key);
}
export async function get(key) {
  return await client.get(key);
}
export async function mGet(keys) {
  return await client.mGet(keys);
}
export async function ttl(key) {
  return await client.ttl(key);
}
export async function exists(key) {
  return await client.exists(key);
}
export async function persist(key) {
  return await client.persist(key);
}
export async function del(key) {
  return await client.del(key);
}
export async function update(key, value) {
  if (!(await exists(key))) {
    return 0;
  }
  await client.set(key, value);
  return 1;
}
export async function setExpire(key, seconds) {
  await client.expire(key, seconds);
}
export function blacklistTokenKey({ userId, tokenData }) {
  return `blacklistTokens::${userId}::${tokenData}`;
}
export function getOTPKey({ email, emailType }) {
  return `otp::${email}::${emailType}`;
}
export function getOTPNoReqKey({ email, emailType }) {
  return `otp::${email}::${emailType}::No`;
}
export function getOTPBlockedKey({ email, emailType }) {
  return `otp::${email}::${emailType}::Blocked`;
}
