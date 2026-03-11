import { Router } from "express";
import { getUser } from "../controllers/user.controller.js";
import { authenticateAccessToken } from "../middlewares/authenticate.middleware.js";

const userRouter = Router();

// Protected route: only accessible with valid access token
userRouter.get("/me", authenticateAccessToken, getUser);

export default userRouter;