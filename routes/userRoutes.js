import express from "express";
import {verifyToken, verifyAdmin, verifyUser } from "../middlewares/verifyToken.js";
import { addFavorite, deleteUser, getAllUsers, getFavorites, getUser, removeFavorite, updateUser } from "../controllers/userController.js";

const router = express.Router();


router.post("/favorites/:recipeId", verifyToken, addFavorite);
router.delete("/favorites/:recipeId", verifyToken, removeFavorite);
router.get("/favorites",verifyToken, getFavorites);

router.put("/:id", verifyUser, updateUser);
router.get("/:id", verifyAdmin, getUser);
router.get("/", verifyAdmin, getAllUsers);
router.delete("/:id", verifyUser, deleteUser);


export default router;