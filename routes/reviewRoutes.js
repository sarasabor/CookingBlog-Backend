import express from "express";
import { createReview, deleteReview, getReviewsByRecipeId } from "../controllers/reviewController.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.post("/:recipeId",verifyToken, createReview);
router.get("/:recipeId", getReviewsByRecipeId);
router.delete("/:id",verifyToken, deleteReview);

export default router;