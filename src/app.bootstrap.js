import express from "express";
import { PORT } from "../config/config.service.js";
import authRouter from "./modules/auth/auth.controller.js";
import connectDB from "./DB/connection.js";
import { globalErrorHandling } from "./common/Responses/responses.js";
import userRouter from "./modules/user/user.controller.js";
import cors from "cors";
import path from "path";
import { connectRedis } from "./DB/redis.connection.js";
import messageRouter from "./modules/message/message.controller.js";
import helmet from "helmet";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import geolite from "geoip-lite";
import * as redisService from "./DB/redis.service.js";
async function bootstrap() {
  const app = express();
  const port = PORT;
  await connectDB();
  await connectRedis();
  app.set("trust proxy", true); // trust first proxy, needed for rate limiting to work correctly when behind a proxy (like nginx or cloudflare) and to get the correct client IP address from req.ip and req.headers['x-forwarded-for']
  app.use(
    express.json(),
    cors({}),
    helmet(),
    rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      // limit: () => {
      //   if (process.env.NODE_ENV === "prod") {
      //     return 100;
      //   }
      // },
      limit: (req) => {
        const getInfo=geolite.lookup(req.ip) || {};
        return getInfo.country == "EG" ? 3 : 1; // limit to 3 requests per minute for users from Egypt, no limit for other countries
      },
      // limit: 100, // limit each IP to 100 requests per windowMs
      // message: "Too many requests from this user, please try again later.",
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      // statusCode: 429, // 429 status = Too Many Requests (RFC 6585)
      // standardHeaders: true, // Enable the `RateLimit-*` headers
      // skipFailedRequests: true, // Do not count failed requests (status >= 400) against the rate limit
      // skipSuccessfulRequests: false, // Count successful requests (status < 400) against the rate limit
      handler: (req, res) => {
        res.status(429).json({
          message: "Too many requests from this user, please try again later.",
        });
      }, //overload status code and message for rate limit exceeded error
      requestPropertyName: "rateLimit", // Add rate limit info to request object
      keyGenerator: (req) => {
        const ip = ipKeyGenerator(req.ip)
        return `${ip}-${req.path}`; // Use IP and path as the key for rate limiting
      },
      store:{
        async incr(key,cb){
          const hits =await redisService.incr(key);
          if(hits === 1){
            await redisService.setExpire(key, 60); // set expiration for the key to 60 seconds (1 minute) when it's first created
          }
          cb(null,hits);
        },
        async decrement(key,cb){
          const isKeyExist=await redisService.exists(key);
          if(isKeyExist){
            await redisService.decr(key);
          }
        }
      }
    }),
  );

  app.use("/", (req, res, next) => {
    console.log({ "req.rateLimit": req.rateLimit });// log the rate limit info for the request
    console.log(req.headers["x-forwarded-for"] );// log the client's IP address
    console.log(req.ip);// log Express's determined IP address for the request
    
    next();
  });
  app.use("/uploads", express.static(path.resolve("./uploads")));
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/message", messageRouter);
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  //global error handling middleware
  app.use(globalErrorHandling);
  app.listen(port,"0.0.0.0" ,() => {
    console.log(`Server is running on port ::${port}`);
  });
}
export default bootstrap;
