import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";

// ✅ Register
export const register = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).json({ message: "⚠️ Username already exists!" });
    }

    const existingEmail = await User.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.status(400).json({ message: "⚠️ Email already exists!" });
    }

    const salt = bcrypt.genSaltSync(10); // ✅ Faster than 20
    const hash = bcrypt.hashSync(req.body.password, salt);

    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hash,
    });

    await newUser.save();
    res.status(200).send("✅ User has been created!");
  } catch (err) {
    next(err);
  }
};

// ✅ Login
export const login = async (req, res, next) => {
  const start = Date.now(); // ⏱️ timing

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(createError(404, "User not Found!"));

    const isPassword = await bcrypt.compare(req.body.password, user.password);
    if (!isPassword)
      return next(createError(400, "❌ Wrong email or password!"));

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password, ...otherDetails } = user._doc;

    res
      .cookie("access_token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "Lax",
      })
      .status(200)
      .json({ ...otherDetails });

    console.log("⏱️ Login executed in:", Date.now() - start, "ms"); // debug time
  } catch (err) {
    next(err);
  }
};

// ✅ Get Profile
export const getProfile = (req, res) => {
  try {
    console.log("👤 req.user:", req.user);

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json(req.user);
  } catch (err) {
    console.error("❌ Error in getProfile:", err);
    res.status(500).json({ message: "Server error" });
  }
};
