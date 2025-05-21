// import User from "../models/User.js";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { createError } from "../utils/error.js";

// // ✅ Register
// export const register = async (req, res, next) => {
//   try {
//     const existingUser = await User.findOne({ username: req.body.username });
//     if (existingUser) {
//       return res.status(400).json({ message: "⚠️ Username already exists!" });
//     }

//     const existingEmail = await User.findOne({ email: req.body.email });
//     if (existingEmail) {
//       return res.status(400).json({ message: "⚠️ Email already exists!" });
//     }

//     const salt = bcrypt.genSaltSync(10); // ✅ Faster than 20
//     const hash = bcrypt.hashSync(req.body.password, salt);

//     const newUser = new User({
//       username: req.body.username,
//       email: req.body.email,
//       password: hash,
//     });

//     await newUser.save();
//     res.status(200).send("✅ User has been created!");
//   } catch (err) {
//     next(err);
//   }
// };

// // ✅ Login
// export const login = async (req, res, next) => {
//   const start = Date.now(); // ⏱️ timing

//   try {
//     const user = await User.findOne({ email: req.body.email });
//     if (!user) return next(createError(404, "User not Found!"));

//     const isPassword = await bcrypt.compare(req.body.password, user.password);
//     if (!isPassword)
//       return next(createError(400, "❌ Wrong email or password!"));

//     const token = jwt.sign(
//       {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         isAdmin: user.isAdmin,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     const { password, ...otherDetails } = user._doc;

//     res
//       .cookie("access_token", token, {
//         httpOnly: true,
//         maxAge: 24 * 60 * 60 * 1000,
//         sameSite: "Lax",
//       })
//       .status(200)
//       .json({ ...otherDetails });

//     console.log("⏱️ Login executed in:", Date.now() - start, "ms"); // debug time
//   } catch (err) {
//     next(err);
//   }
// };

// // ✅ Get Profile
// export const getProfile = (req, res) => {
//   try {
//     console.log("👤 req.user:", req.user);

//     if (!req.user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     res.status(200).json(req.user);
//   } catch (err) {
//     console.error("❌ Error in getProfile:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

import User from "../models/User.js";
import bcrypt from "bcrypt";
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

    // 🔒 Hash password (lower cost for better perf)
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    // ✅ Save new user
    const newUser = new User({ username, email, password: hash });
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
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: _, ...userData } = user._doc;

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
export const getProfile = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.status(200).json(req.user);
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

