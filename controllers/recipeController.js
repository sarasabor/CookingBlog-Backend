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
    try{
        const recipes = await Recipe.find();
        res.status(200).json(recipes);

    }catch(err){
        next(err)
    };
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