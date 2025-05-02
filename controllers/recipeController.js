import Recipe from "../models/Recipe.js";
import Review from "../models/Review.js";
import { createError } from "../utils/error.js";

export const createRecipe = async (req, res, next)=>{

        const newRecipe = new Recipe({ ...req.body, userId: req.user.id });

    try{
        const savedRecipe = await newRecipe.save();
        res.status(200).json(savedRecipe)
        
    }catch(err){
        next(err)
    };
};

export const updateRecipe = async (req, res, next)=>{
    try{
        const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, {$set: req.body}, {new: true});
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
