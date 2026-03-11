import express from "express";
import cookieParser from "cookie-parser";

import { PORT } from "./config/env.js";
import connectToDatabase from "./database/mongodb.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Logger
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

// Error handling
app.use(errorMiddleware);

// Connect to DB and start server
(async () => {
  try {
    await connectToDatabase();

    const serverPort = PORT || 5500;
    app.listen(serverPort, () =>
      console.log(`🚀 Server is listening on port ${serverPort}`)
    );
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
})();