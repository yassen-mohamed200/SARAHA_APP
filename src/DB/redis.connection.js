import { createClient } from "redis";
import { REDIS_URL } from "../../config/config.service.js";


export const client = createClient({
  url: REDIS_URL,
});
client.on("error", (err) => {
  console.error("Redis Client Error:", err);
});
export const connectRedis = async () => {
  try {
    await client.connect();
    console.log("redis connected");
  } catch (error) {
    console.error("Error connecting to Redis:", error);
  }
};
