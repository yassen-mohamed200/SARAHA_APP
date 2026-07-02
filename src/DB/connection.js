import { connect } from "mongoose";
import { DB_URL_ATLAS, DB_URL_LOCAL } from "../../config/config.service.js";

async function connectDB() {
  try {
    await connect(DB_URL_ATLAS);
    console.log("successfully Connected to Database");
  } catch (err) {

    console.log("failed connecting to Database", err);
  }

}
export default connectDB;
