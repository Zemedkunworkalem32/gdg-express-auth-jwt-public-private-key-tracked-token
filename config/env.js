import { config } from "dotenv";
config(); // loads .env automatically

export const {
  PORT,
  DB_URI,
  ACCESS_TOKEN_EXPIRE_DATE,
  REFRESH_TOKEN_EXPIRE_DATE,
  ACCESS_TOKEN_PUBLIC_KEY,
  ACCESS_TOKEN_PRIVATE_KEY,
  REFRESH_TOKEN_PUBLIC_KEY,
  REFRESH_TOKEN_PRIVATE_KEY,
} = { ...process.env };

console.log("MongoDB URI:", DB_URI ? DB_URI : "❌ DB_URI is missing");
console.log("Server PORT:", PORT ? PORT : 5500);