import express from "express";
import {
  createRecipe,
  getAllRecipes,
  getRecipe,
  getRecipeWithReviews,
  updateRecipe,
  rateRecipe,
  getRecipesByMood,
  getSmartSuggestions,
  getMoodSuggestions,
} from "../controllers/recipeController.js";
import { createReview } from "../controllers/reviewController.js";

import { verifyAdmin, verifyToken, verifyTokenRecipe } from "../middlewares/verifyToken.js";
import multer from "multer";
import { storage } from "../utils/cloudinary.js";

const router = express.Router();
const upload = multer({ storage });

// ✅ مسارات خاصة يجب أن تكون أولاً
router.get("/with-reviews/:id", getRecipeWithReviews);
router.get("/mood/:mood", getRecipesByMood);
router.post("/smart-suggestions", getSmartSuggestions);
router.post("/suggestions/by-mood", getMoodSuggestions);
router.post("/:id/rate", verifyToken, rateRecipe); // 

// ✅ المسارات العامة بعد الخاصة
router.post("/", verifyTokenRecipe, verifyAdmin, upload.single("image"), createRecipe);
router.get("/", getAllRecipes);
router.get("/:id", getRecipe);
router.put("/:id", verifyTokenRecipe, verifyAdmin, upload.single("image"), updateRecipe);
// router.delete("/:id", verifyTokenRecipe, deleteRecipe);
router.post("/reviews/:recipeId", verifyToken, createReview);


export default router;
