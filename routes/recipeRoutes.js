import express from "express";
import { createRecipe, deleteRecipe, getAllRecipes, getRecipe, updateRecipe } from "../controllers/recipeController.js";
import { verifyTokenRecipe } from "../middlewares/verifyToken.js";


const router = express.Router();


router.post("/", verifyTokenRecipe, createRecipe);
router.get("/:id", getRecipe);
router.get("/", getAllRecipes);
router.put("/:id", verifyTokenRecipe, updateRecipe);
router.delete("/:id", verifyTokenRecipe, deleteRecipe);

export default router;

