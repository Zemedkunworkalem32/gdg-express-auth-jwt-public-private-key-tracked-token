import mongoose from "mongoose";
import { DB_URI } from "../config/env.js";

const connectToDatabase = async () => {
  if (!DB_URI) {
    console.error("❌ DB_URI is missing. Please set it in .env");
    return;
  }

  try {
    await mongoose.connect(DB_URI);
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error(`❌ Not connected to the database: ${err.message}`);
  }
};

export default connectToDatabase;