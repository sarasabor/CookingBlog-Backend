import Recipe from "../models/Recipe.js";
import Review from "../models/Review.js";
import { createError } from "../utils/error.js";
import { cloudinary } from "../utils/cloudinary.js";


export const createRecipe = async (req, res, next)=>{

        const newRecipe = new Recipe({ ...req.body,
        image: req.file?.path || "",
        cloudinary_id: req.file?.filename || "",
        userId: req.user.id });

    try{
        const savedRecipe = await newRecipe.save();
        res.status(201).json(savedRecipe)
        
    }catch(err){
        next(err)
    };
};

export const updateRecipe = async (req, res, next)=>{
    try{
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

    }catch(err){
        next(err)
    };
};


export const getRecipe = async (req, res, next)=>{
    try{
        const recipe = await Recipe.findById(req.params.id);
        res.status(200).json(recipe);

    }catch(err){
        next(err)
    };
};

export const getAllRecipes = async (req, res, next)=>{
    const {page = 1, limit = 10, search = ""} = req.query;

    try {
        const query = {
          title: { $regex: search, $options: "i" },
        };
    
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
  const { mood, ingredients, servings } = req.body;

  try {
    const recipes = await Recipe.find({
      mood,
      ingredients: { $in: ingredients }, // أي وصفة فيها شي عنصر من لي دار المستخدم
    });

    // نحسبو نسبة التطابق
    const scored = recipes.map((recipe) => {
      const common = recipe.ingredients.filter((ing) =>
        ingredients.includes(ing)
      );
      const score = common.length / recipe.ingredients.length;
      return { recipe, score };
    });

    // نرتب حسب أفضل تطابق
    scored.sort((a, b) => b.score - a.score);

    // نرجعو فقط recipes ديال أعلى 5
    const topRecipes = scored.slice(0, 5).map((r) => r.recipe);

    res.status(200).json(topRecipes);
  } catch (err) {
    next(err);
  }
};


    

export const deleteRecipe = async (req, res, next)=>{
    try{
        await Recipe.findByIdAndDelete(req.params.id);
        res.status(200).json("Recipe deleted succussfully!")

    }catch(err){
        next(err)
    }
};


export const getRecipeWithReviews = async (req, res, next)=>{
    try{
        const recipe = await Recipe.findById(req.params.id).lean();
        if(!recipe) return next(createError(404, "Recipe not found!"));

        const reviews = await Review.find({recipeId: req.params.id});

        res.status(200).json({...recipe, reviews});

    }catch(err){
        next(err)
    };
};
