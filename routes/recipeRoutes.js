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
  getAISuggestions,
} from "../controllers/recipeController.js";

import { createReview } from "../controllers/reviewController.js";
import { verifyAdmin, verifyToken, verifyTokenRecipe } from "../middlewares/verifyToken.js";

import multer from "multer";
import { storage } from "../utils/cloudinary.js";

const router = express.Router();
const upload = multer({ storage });

// ✅ 1. المسارات الخاصة أولاً (الأكثر تحديدًا)
router.post("/ai-suggestions", getAISuggestions);
router.post("/smart-suggestions", getSmartSuggestions);
router.post("/suggestions/by-mood", getMoodSuggestions);
router.get("/with-reviews/:id", getRecipeWithReviews);
router.get("/mood/:mood", getRecipesByMood);
router.post("/reviews/:recipeId", verifyToken, createReview); // ✅ moved up
router.post("/:id/rate", verifyToken, rateRecipe);

// ✅ 2. مسارات CRUD
router.post("/", verifyTokenRecipe, verifyAdmin, upload.single("image"), createRecipe);
router.put("/:id", verifyTokenRecipe, verifyAdmin, upload.single("image"), updateRecipe);
router.get("/", getAllRecipes);

// ✅ 3. أخيرًا: route العامة (id)
router.get("/:id", getRecipe);

export default router;
