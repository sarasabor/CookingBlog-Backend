import express from "express";
import { createRecipe, deleteRecipe, getAllRecipes, getRecipe, getRecipeWithReviews, updateRecipe } from "../controllers/recipeController.js";
import { verifyTokenRecipe } from "../middlewares/verifyToken.js";
import multer from "multer";
import { storage } from "../utils/cloudinary.js";


const router = express.Router();
const upload = multer({ storage });


router.post("/", verifyTokenRecipe, upload.single("image"), createRecipe);
router.get("/:id", getRecipe);
router.get("/", getAllRecipes);
router.put("/:id", verifyTokenRecipe, upload.single("image"), updateRecipe);
router.delete("/:id", verifyTokenRecipe, deleteRecipe);
router.get("/with-reviews/:id", getRecipeWithReviews);

export default router;

