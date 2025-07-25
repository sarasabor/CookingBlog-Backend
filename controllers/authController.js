import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";

// ✅ Register
export const register = async (req, res, next) => {
  const start = Date.now(); // ⏱️

  try {
    const { username, email, password } = req.body;

    // 🔍 Check if user or email exists
    const [existingUser, existingEmail] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ email }),
    ]);

    if (existingUser)
      return res.status(400).json({ message: "⚠️ Username already exists!" });

    if (existingEmail)
      return res.status(400).json({ message: "⚠️ Email already exists!" });

    // 🔒 Hash password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

 
    const newUser = new User({
      username,
      email,
      password: hash,
      role: "user" 
    });

    await newUser.save();

    console.log("✅ Register completed in", Date.now() - start, "ms");
    res.status(200).send("✅ User has been created!");
  } catch (err) {
    next(err);
  }
};


// ✅ Login
export const login = async (req, res, next) => {
  const start = Date.now(); // ⏱️

  try {
    const { email, password } = req.body;

    // 🔍 Find user by email
    const user = await User.findOne({ email });
    if (!user) return next(createError(404, "❌ User not found!"));

    // 🔐 Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect)
      return next(createError(400, "❌ Wrong email or password!"));

    // 🔑 Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: _, ...userData } = user._doc;
      userData.role = user.role;
    // 🍪 Send cookie
    res
      .cookie("access_token", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "Lax",
      })
      .status(200)
      .json(userData);

    console.log("✅ Login completed in", Date.now() - start, "ms");
  } catch (err) {
    next(err);
  }
};

// ✅ Get Profile 
export const getProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

  
    const user = await User.findById(req.user.id).populate("favorites");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userData } = user._doc;
    res.status(200).json(userData);
  } catch (err) {
    console.error("❌ Error in getProfile:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const logout = (req, res) => {
  res
    .clearCookie("access_token", {
      httpOnly: true,
      sameSite: "Lax",
    })
    .status(200)
    .json({ message: "🚪 Logged out successfully!" });
};

