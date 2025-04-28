import express from "express";
import {verifyToken, verifyAdmin, verifyUser } from "../middlewares/verifyToken.js";
import { deleteUser, getAllUsers, getUser, updateUser } from "../controllers/userController.js";

const router = express.Router();

router.put("/:id", verifyUser, updateUser);
router.get("/:id", verifyAdmin, getUser);
router.get("/", verifyAdmin, getAllUsers);
router.delete("/:id", verifyUser, deleteUser);

export default router;