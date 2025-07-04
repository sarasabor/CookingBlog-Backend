import Recipe from "../models/Recipe.js";
import Review from "../models/Review.js";
import { createError } from "../utils/error.js";
import { cloudinary } from "../utils/cloudinary.js";
import moodToTagsMap from "../utils/moodToTagsMap.js";

export const createRecipe = async (req, res, next)=>{
  const newRecipe = new Recipe({ 
    ...req.body,
    image: req.file?.path || "",
    cloudinary_id: req.file?.filename || "",
    userId: req.user.id 
  });

  try {
    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
  } catch(err) {
    next(err);
  }
};

export const updateRecipe = async (req, res, next)=>{
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found!" });

    const updatedFields = {
      ...req.body,
    };

    if (req.file) {
      if (recipe.cloudinary_id) {
        await cloudinary.uploader.destroy(recipe.cloudinary_id);
      }
      updatedFields.image = req.file.path;
      updatedFields.cloudinary_id = req.file.filename;
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, {$set: updatedFields}, {new: true});
    res.status(200).json(updatedRecipe);
  } catch(err) {
    next(err);
  }
};

export const getRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).lean();
    if (!recipe) return next(createError(404, "Recipe not found!"));

    const ratings = await Review.aggregate([
      { $match: { recipeId: recipe._id } },
      {
        $group: {
          _id: "$recipeId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const ratingData = ratings[0] || { averageRating: null, totalReviews: 0 };

    res.status(200).json({
      ...recipe,
      averageRating: ratingData.averageRating,
      totalReviews: ratingData.totalReviews,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllRecipes = async (req, res, next) => {
  const { page = 1, limit = 10, search = "", mood, lang = "en" } = req.query;

  try {
    const query = {};

    if (search) {
      query[`title.${lang}`] = { $regex: search, $options: "i" };
    }

    if (mood) {
      query.mood = { $regex: `^${mood}$`, $options: "i" };
    }

    const recipes = await Recipe.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Recipe.countDocuments(query);

    res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      recipes,
    });
  } catch (err) {
    next(err);
  }
};

export const getRecipesByMood = async (req, res, next) => {
  const { mood } = req.params;

  try {
    const recipes = await Recipe.find({ mood }).limit(10);
    res.status(200).json(recipes);
  } catch (err) {
    next(err);
  }
};

export const getSmartSuggestions = async (req, res, next) => {
  const { mood, ingredients, servings, maxCookTime, minRating = 0 } = req.body;
  const lang = req.headers["accept-language"] || "en";

  try {
    if (!ingredients || ingredients.length < 2) {
      return res.status(400).json({ message: "At least two ingredients are required." });
    }


    const query = {
      [`ingredients.name.${lang}`]: { $in: ingredients }, 
    };

    if (mood) query.mood = mood;
    if (maxCookTime) query.cookTime = { $lte: maxCookTime };

    const recipes = await Recipe.find(query);

   
    const ratings = await Review.aggregate([
      {
        $match: {
          recipeId: { $in: recipes.map((r) => r._id) },
        },
      },
      {
        $group: {
          _id: "$recipeId",
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    const ratingMap = ratings.reduce((acc, r) => {
      acc[r._id.toString()] = r.averageRating;
      return acc;
    }, {});


    const scored = recipes
      .map((recipe) => {
        const common = recipe.ingredients.filter((ing) =>
          ingredients.includes(ing.name[lang])
        );
        const score = common.length / recipe.ingredients.length;
        const avgRating = ratingMap[recipe._id.toString()] || 0;
        return { recipe, score, avgRating };
      })
      .filter((r) => r.avgRating >= minRating);

    scored.sort((a, b) => {
      if (b.score === a.score) {
        return b.avgRating - a.avgRating;
      }
      return b.score - a.score;
    });

    const topRecipes = scored.slice(0, 10).map((r) => r.recipe);

    res.status(200).json(topRecipes);
  } catch (err) {
    console.error("Error in getSmartSuggestions:", err);
    next(err);
  }
};

export const getRecipeWithReviews = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).lean();
    if (!recipe) return next(createError(404, "Recipe not found!"));
   
    const reviews = await Review.find({ recipeId: req.params.id });

    const ratings = await Review.aggregate([
      { $match: { recipeId: recipe._id } },
      {
        $group: {
          _id: "$recipeId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const ratingData = ratings[0] || { averageRating: null, totalReviews: 0 };

    res.status(200).json({
      ...recipe,
      reviews,
      averageRating: ratingData.averageRating,
      totalReviews: ratingData.totalReviews,
    });
  } catch (err) {
    next(err);
  }
};

export const getMoodSuggestions = async (req, res) => {
  try {
    const { mood } = req.body;

    if (!mood || !moodToTagsMap[mood]) {
      return res.status(400).json({ error: "Invalid or missing mood" });
    }

    const tags = moodToTagsMap[mood];

    const recipes = await Recipe.find({ tags: { $in: tags } }).limit(5);

    res.json({ mood, recipes });
  } catch (error) {
    console.error("Error in getMoodSuggestions:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const rateRecipe = async (req, res, next) => {
  try {
    const { rating, comment = "" } = req.body;
    const { id: recipeId } = req.params;
    const userId = req.user.id;

 
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

   
    let review = await Review.findOne({ recipeId, userId });

    if (review) {

      review.rating = rating;
      review.comment = comment;
      await review.save();
      return res.status(200).json({ message: "Review updated", review });
    } else {

      review = new Review({ userId, recipeId, rating, comment });
      await review.save();
      return res.status(201).json({ message: "Review created", review });
    }
  } catch (err) {
    next(err);
  }
};
