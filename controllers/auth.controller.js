import User from "../models/user.model.js";
import RefreshToken from "../models/refresh_token.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRE_DATE,
  ACCESS_TOKEN_PRIVATE_KEY,
  REFRESH_TOKEN_EXPIRE_DATE,
  REFRESH_TOKEN_PRIVATE_KEY,
  REFRESH_TOKEN_PUBLIC_KEY,
} from "../config/env.js";

// --- SIGN UP ---
export const signUp = async (req, res, next) => {
  try {
    const { full_name, email, password } = req.body;
    if (!full_name || !email || !password) throw { statusCode: 400, message: "full_name,email,password required" };
    if (await User.findOne({ email })) throw { statusCode: 409, message: "User already exists" };
    if (password.length < 8) throw { statusCode: 409, message: "Password too short" };

    const hashed_password = await bcrypt.hash(password, 10);
    const newUser = await User.create({ full_name, email, password: hashed_password });

    const access_token = jwt.sign({ user_id: newUser._id }, ACCESS_TOKEN_PRIVATE_KEY, { algorithm: "RS256", expiresIn: ACCESS_TOKEN_EXPIRE_DATE });
    const refresh_token = jwt.sign({ user_id: newUser._id }, REFRESH_TOKEN_PRIVATE_KEY, { algorithm: "RS256", expiresIn: REFRESH_TOKEN_EXPIRE_DATE });

    res.cookie("access_token", access_token, { maxAge: 1000 * 60 * 15, httpOnly: true, sameSite: "lax" });
    res.cookie("refresh_token", refresh_token, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true, sameSite: "lax" });

    const hashed_refresh_token = crypto.createHash("sha256").update(refresh_token).digest("hex");
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 90);

    await RefreshToken.create({ user_id: newUser._id, refresh_token: hashed_refresh_token, expires_at });

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({ success: true, data: { user: userObj, access_token, refresh_token } });
  } catch (err) {
    next(err);
  }
};

// --- SIGN IN ---
export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw { statusCode: 400, message: "email,password required" };

    const user = await User.findOne({ email });
    if (!user) throw { statusCode: 404, message: "User not found" };

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) throw { statusCode: 401, message: "Invalid credentials" };

    const access_token = jwt.sign({ user_id: user._id }, ACCESS_TOKEN_PRIVATE_KEY, { algorithm: "RS256", expiresIn: ACCESS_TOKEN_EXPIRE_DATE });
    const refresh_token = jwt.sign({ user_id: user._id }, REFRESH_TOKEN_PRIVATE_KEY, { algorithm: "RS256", expiresIn: REFRESH_TOKEN_EXPIRE_DATE });

    res.cookie("access_token", access_token, { maxAge: 1000 * 60 * 15, httpOnly: true, sameSite: "lax" });
    res.cookie("refresh_token", refresh_token, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true, sameSite: "lax" });

    const hashed_refresh_token = crypto.createHash("sha256").update(refresh_token).digest("hex");
    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + 90);

    await RefreshToken.create({ user_id: user._id, refresh_token: hashed_refresh_token, expires_at });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ success: true, data: { user: userObj, access_token, refresh_token } });
  } catch (err) {
    next(err);
  }
};

// --- LOGOUT ---
export const logout = async (req, res, next) => {
  try {
    const refresh_token = req.cookies?.refresh_token;
    if (refresh_token) {
      const hashed_refresh_token = crypto.createHash("sha256").update(refresh_token).digest("hex");
      await RefreshToken.deleteOne({ refresh_token: hashed_refresh_token });
    }

    res.clearCookie("access_token", { httpOnly: true, sameSite: "lax" });
    res.clearCookie("refresh_token", { httpOnly: true, sameSite: "lax" });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

// --- REFRESH TOKEN ---
export const refreshToken = async (req, res, next) => {
  try {
    const refresh_token = req.cookies?.refresh_token;
    if (!refresh_token) throw { statusCode: 401, message: "Refresh token missing" };

    const hashed_refresh_token = crypto.createHash("sha256").update(refresh_token).digest("hex");
    const db_refresh_token = await RefreshToken.findOne({ refresh_token: hashed_refresh_token });
    if (!db_refresh_token) throw { statusCode: 401, message: "Unauthorized" };

    const decoded = jwt.verify(refresh_token, REFRESH_TOKEN_PUBLIC_KEY);
    const access_token = jwt.sign({ user_id: decoded.user_id }, ACCESS_TOKEN_PRIVATE_KEY, { algorithm: "RS256", expiresIn: ACCESS_TOKEN_EXPIRE_DATE });

    res.cookie("access_token", access_token, { maxAge: 1000 * 60 * 15, httpOnly: true, sameSite: "lax" });
    res.status(201).json({ success: true, data: { access_token } });
  } catch (err) {
    next(err);
  }
};