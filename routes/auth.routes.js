import { Router } from "express";
import { signUp, signIn, refreshToken, logout } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/sign-up", signUp);
authRouter.post("/sign-in", signIn);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/logout", logout); // ✅ Logout endpoint

export default authRouter;