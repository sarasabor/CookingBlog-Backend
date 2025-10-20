import Recipe from "../models/Recipe.js";
import Review from "../models/Review.js";
import { createError } from "../utils/error.js";
import { cloudinary } from "../utils/cloudinary.js";
import moodToTagsMap from "../utils/moodToTagsMap.js";

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

    // Analyze the prompt for keywords
    const promptLower = prompt.toLowerCase();
    let detectedMood = mood;
    let detectedIngredients = [...ingredients];
    let detectedTags = [];

    // Detect mood from prompt
    const moodKeywords = {
      stressed: ["stressed", "stress", "anxious", "anxiety", "stressé", "anxieux", "متوتر", "قلق"],
      sad: ["sad", "depressed", "down", "lonely", "triste", "déprimé", "حزين", "كئيب"],
      happy: ["happy", "joyful", "celebrate", "celebration", "heureux", "joyeux", "سعيد", "مبهج"],
      tired: ["tired", "exhausted", "fatigue", "fatigué", "épuisé", "متعب", "مرهق"],
      hungry: ["hungry", "starving", "famished", "affamé", "جائع"],
      energetic: ["energetic", "active", "workout", "énergique", "actif", "نشيط"],
      romantic: ["romantic", "date", "love", "romantique", "amour", "رومانسي", "حب"],
      relaxed: ["relaxed", "calm", "peaceful", "détendu", "calme", "مسترخي", "هادئ"],
      bored: ["bored", "boring", "ennuyé", "ennuyeux", "ملل"]
    };

    for (const [moodKey, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => promptLower.includes(keyword))) {
        detectedMood = moodKey;
        break;
      }
    }

    // Detect time/speed requirements
    const quickKeywords = ["quick", "fast", "rapide", "vite", "سريع", "easy", "facile", "سهل"];
    const isQuickRequest = quickKeywords.some(keyword => promptLower.includes(keyword));

    // Detect common ingredients from prompt
    const commonIngredients = {
      chicken: ["chicken", "poulet", "دجاج"],
      beef: ["beef", "boeuf", "لحم بقري"],
      fish: ["fish", "poisson", "سمك"],
      vegetables: ["vegetable", "veggie", "légume", "خضروات"],
      pasta: ["pasta", "pâtes", "معكرونة"],
      rice: ["rice", "riz", "أرز"]
    };

    for (const [ingredientKey, keywords] of Object.entries(commonIngredients)) {
      if (keywords.some(keyword => promptLower.includes(keyword)) && !detectedIngredients.includes(ingredientKey)) {
        detectedIngredients.push(ingredientKey);
      }
    }

    // Build query
    const query = {};
    
    // Add mood-based tags
    if (detectedMood && moodToTagsMap[detectedMood]) {
      detectedTags = moodToTagsMap[detectedMood];
      query.tags = { $in: detectedTags };
    }

    // Add cook time filter if quick is requested
    if (isQuickRequest) {
      query.cookTime = { $lte: 30 };
    }

    // Add ingredients filter if detected
    if (detectedIngredients.length > 0) {
      query[`ingredients.name.${lang}`] = { $in: detectedIngredients };
    }

    console.log("🔍 Query:", JSON.stringify(query, null, 2));

    // Fetch recipes
    let recipes = await Recipe.find(query).limit(6);

    // If no recipes found, try with just mood or remove filters
    if (recipes.length === 0 && detectedMood) {
      console.log("⚠️ No recipes with full criteria, trying mood only");
      recipes = await Recipe.find({ 
        tags: { $in: moodToTagsMap[detectedMood] } 
      }).limit(6);
    }

    // If still no recipes, get some popular ones
    if (recipes.length === 0) {
      console.log("⚠️ No recipes found, returning popular recipes");
      recipes = await Recipe.find({}).limit(6);
    }

    // Get ratings for recipes
    const recipeIds = recipes.map(r => r._id);
    const ratings = await Review.aggregate([
      { $match: { recipeId: { $in: recipeIds } } },
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

    // Sort by rating
    recipes.sort((a, b) => {
      const ratingA = ratingMap[a._id.toString()] || 0;
      const ratingB = ratingMap[b._id.toString()] || 0;
      return ratingB - ratingA;
    });

    // Generate AI message based on language
    let aiMessage = "";
    
    if (lang === "fr") {
      aiMessage = `Voici mes suggestions basées sur votre demande "${prompt}".\n\n`;
      if (detectedMood) {
        aiMessage += `J'ai détecté que vous vous sentez ${detectedMood === 'stressed' ? 'stressé(e)' : detectedMood === 'happy' ? 'heureux(se)' : detectedMood}. `;
      }
      if (isQuickRequest) {
        aiMessage += `Je vous propose des recettes rapides (moins de 30 minutes). `;
      }
      if (detectedIngredients.length > 0) {
        aiMessage += `J'ai trouvé des recettes avec: ${detectedIngredients.join(", ")}. `;
      }
      aiMessage += `\n\nCes ${recipes.length} recettes sont parfaites pour vous ! Bon appétit ! 🍽️`;
    } else if (lang === "ar") {
      aiMessage = `إليك اقتراحاتي بناءً على طلبك "${prompt}".\n\n`;
      if (detectedMood) {
        aiMessage += `لقد اكتشفت أنك تشعر بـ ${detectedMood}. `;
      }
      if (isQuickRequest) {
        aiMessage += `أقترح عليك وصفات سريعة (أقل من 30 دقيقة). `;
      }
      if (detectedIngredients.length > 0) {
        aiMessage += `وجدت وصفات مع: ${detectedIngredients.join("، ")}. `;
      }
      aiMessage += `\n\nهذه ${recipes.length} وصفات مثالية لك! بالهناء والشفاء! 🍽️`;
    } else {
      aiMessage = `Here are my suggestions based on your request "${prompt}".\n\n`;
      if (detectedMood) {
        aiMessage += `I detected that you're feeling ${detectedMood}. `;
      }
      if (isQuickRequest) {
        aiMessage += `I'm suggesting quick recipes (under 30 minutes). `;
      }
      if (detectedIngredients.length > 0) {
        aiMessage += `I found recipes with: ${detectedIngredients.join(", ")}. `;
      }
      aiMessage += `\n\nThese ${recipes.length} recipes are perfect for you! Enjoy! 🍽️`;
    }

    res.status(200).json({
      message: aiMessage,
      recipes: recipes,
      detectedContext: {
        mood: detectedMood,
        ingredients: detectedIngredients,
        isQuick: isQuickRequest,
        tags: detectedTags
      }
    });

  } catch (err) {
    console.error("❌ Error in getAISuggestions:", err);
    next(err);
  }
};