import User from "../models/User.js";
import { createError } from "../utils/error.js";

export const getUser = async (req, res, next)=>{
    try{
        const user = await User.findById(req.params.id);

        res.status(200).json(user);

    }catch(err){
        next(err)
    };
};

export const getAllUsers = async (req, res, next) => {
    const { page = 1, limit = 10, search = "" } = req.query;
  
    try {
      const query = {
        username: { $regex: search, $options: "i" }, 
      };
  
      const users = await User.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .select("-password")

      const total = await User.countDocuments(query);
  
      res.status(200).json({
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        users,
      });
    } catch (err) {
      next(err);
    }
  };

export const updateUser = async (req, res, next)=>{
    try{
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {$set: req.body}, {new:true});

        res.status(200).json(updatedUser);

    }catch(err){
        next(err)
    };
};

export const deleteUser = async (req, res, next)=>{
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        res.status(200).json("User deleted successfully!")
        
    } catch(err) {
        next(err)
    };
};

export const addFavorite = async (req, res, next)=>{
    try{
        const user = await User.findById(req.user.id);
        if(!user) return next(createError(404, "User not found!"));

        const recipeId = req.params.recipeId;
        if(user.favorites.includes(recipeId)){
        return next(createError(400, "Recipe already in favorites"))};

        user.favorites.push(recipeId);
        await user.save();

        res.status(200).json("Recipe added to favorites!")

    }catch(err){
        next(err)
    };
};


export const removeFavorite = async (req, res, next)=>{
    try{
        const user = await User.findById(req.user.id);
        if(!user) return next(createError(404, "User not found"));

        user.favorites = user.favorites.filter(
            (id) => id.toString() !== req.params.recipeId
        );

        await user.save();

        res.status(200).json("Recipe removed from favorites");

    }catch(err){
        next(err)
    };
};


export const getFavorites = async (req, res, next)=>{
    try{
        const user = await User.findById(req.user.id).populate("favorites");
        if(!user) return next(createError(404, "User not found!"));

        res.status(200).json(user.favorites)
    }catch(err){
        next(err)
    };
};