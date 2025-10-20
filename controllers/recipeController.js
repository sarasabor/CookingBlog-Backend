import Recipe from "../models/Recipe.js";
import Review from "../models/Review.js";
import { createError } from "../utils/error.js";
import { cloudinary } from "../utils/cloudinary.js";
import moodToTagsMap from "../utils/moodToTagsMap.js";
import { generateRecipeSuggestions } from "../services/aiService.js";

export const createRecipe = async (req, res, next) => {
  try {
    const {
      title,
      description,
      mood,
      instructions,
      cookTime,
      difficulty
    } = req.body;

    // ✅ Parse multi-language ingredients from string
    let ingredients = [];
    if (req.body.ingredients) {
      try {
        ingredients = JSON.parse(req.body.ingredients);
      } catch (e) {
        return res.status(400).json({ message: "Invalid ingredients format" });
      }
    }


    const image = req.file?.path || "";
    const cloudinary_id = req.file?.filename || "";

    const newRecipe = new Recipe({
      title: JSON.parse(title), // Assuming it's multilingual: { en, fr, ar }
      description: JSON.parse(description), // Same here
      mood,
      instructions: JSON.parse(instructions), // Same here
      cookTime,
      difficulty,
      image,
      cloudinary_id,
      ingredients,
      userId: req.user.id,
    });

    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    next(err);
  }
};

export const updateRecipe = async (req, res, next) => {
  try {
    let ingredients = [];

    if (typeof req.body.ingredients === "string") {
      ingredients = JSON.parse(req.body.ingredients);
    } else {
      ingredients = req.body.ingredients;
    }

    const updatedFields = {
      ...req.body,
      ingredients,
    };

    if (req.file) {
      updatedFields.image = req.file.path;
      updatedFields.cloudinary_id = req.file.filename;
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.status(200).json(updatedRecipe);
  } catch (err) {
    console.error("❌ Error updating recipe:", err);
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
  const { mood, ingredients = [], servings, maxCookTime, minRating = 0 } = req.body;
  const lang = req.headers["accept-language"] || "en";

  try {
    // ✅ شرط مرن: mood أو ingredient على الأقل
    if ((!ingredients || ingredients.length < 2) && !mood) {
      return res.status(400).json({ message: "Please provide at least a mood or two ingredients." });
    }

    const query = {};

    // ✅ فلترة حسب المكونات
    if (ingredients.length >= 2) {
      query[`ingredients.name.${lang}`] = { $in: ingredients };
    }

    // ✅ فلترة حسب المزاج
    if (mood) {
      query.mood = mood;
    }

    // ✅ فلترة حسب مدة الطهي
    if (maxCookTime) {
      query.cookTime = { $lte: maxCookTime };
    }

    const recipes = await Recipe.find(query);

    // ✅ جمع التقييمات
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

    // ✅ حساب الـ score حسب عدد المكونات المشتركة
    const scored = recipes
      .map((recipe) => {
        const commonIngredients = ingredients.length >= 2
          ? recipe.ingredients.filter((ing) => ingredients.includes(ing.name[lang]))
          : [];

        const score = ingredients.length >= 2
          ? commonIngredients.length / recipe.ingredients.length
          : 1; // mood only → score = 1

        const avgRating = ratingMap[recipe._id.toString()] || 0;

        return { recipe, score, avgRating };
      })
      .filter((r) => r.avgRating >= minRating);

    // ✅ ترتيب حسب score والتقييم
    scored.sort((a, b) => {
      if (b.score === a.score) {
        return b.avgRating - a.avgRating;
      }
      return b.score - a.score;
    });

    // ✅ إرسال النتائج (10 فقط)
    const topRecipes = scored.slice(0, 10).map((r) => r.recipe);

    res.status(200).json(topRecipes);
  } catch (err) {
    console.error("❌ Error in getSmartSuggestions:", err);
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

export const getAISuggestions = async (req, res, next) => {
  try {
    const { prompt, mood, ingredients = [], servings = 2 } = req.body;
    const lang = req.headers["accept-language"] || "en";

    console.log("🤖 AI Request:", { prompt, mood, ingredients, servings, lang });

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ message: "Prompt is required" });
    }

    // Check if any AI API is configured (Groq is free!)
    if (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) {
      console.warn("⚠️ No AI API key configured");
      
      // Fallback message
      const fallbackMessage = {
        en: "AI service is not available. Please configure GROQ_API_KEY (free!) or OPENAI_API_KEY to generate new recipes.",
        fr: "Le service IA n'est pas disponible. Veuillez configurer GROQ_API_KEY (gratuit !) ou OPENAI_API_KEY pour générer de nouvelles recettes.",
        ar: "خدمة الذكاء الاصطناعي غير متاحة. يرجى تكوين GROQ_API_KEY (مجاني!) أو OPENAI_API_KEY لإنشاء وصفات جديدة."
      };
      
      return res.status(503).json({ 
        message: fallbackMessage[lang] || fallbackMessage.en,
        recipes: []
      });
    }

    // Use AI service to generate new recipes
    const result = await generateRecipeSuggestions({
      prompt,
      mood,
      ingredients,
      servings,
      lang
    });

    res.status(200).json({
      message: result.message,
      recipes: result.recipes,
      isAIGenerated: true,
      generatedAt: new Date().toISOString()
    });

  } catch (err) {
    console.error("❌ Error in getAISuggestions:", err);
    
    // Send user-friendly error message
    const errorMessages = {
      en: "I apologize, but I'm having trouble generating recipes right now. Please try again in a moment.",
      fr: "Je m'excuse, mais j'ai des difficultés à générer des recettes en ce moment. Veuillez réessayer dans un instant.",
      ar: "أعتذر، لكنني أواجه صعوبة في إنشاء الوصفات الآن. يرجى المحاولة مرة أخرى بعد لحظة."
    };
    
    const lang = req.headers["accept-language"] || "en";
    
    res.status(500).json({
      message: errorMessages[lang] || errorMessages.en,
      error: err.message,
      recipes: []
    });
  }
};