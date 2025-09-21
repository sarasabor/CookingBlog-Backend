import express from "express";
import { getProfile, login, logout, register } from "../controllers/authController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes working!" });
});

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, getProfile);
router.get("/logout", logout);

export default router;