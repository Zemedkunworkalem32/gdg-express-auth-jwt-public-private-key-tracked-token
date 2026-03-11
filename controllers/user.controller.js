import User from "../models/user.model.js";

export const getUser = async (req, res, next) => {
  try {
    const id = req.user?._id;
    if (!id) throw { statusCode: 401, message: "Unauthorized" };

    const user = await User.findById(id).select("-password");
    if (!user) throw { statusCode: 404, message: "User not found" };

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};