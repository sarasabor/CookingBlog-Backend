import Review from "../models/Review.js";
import calcuateAverageRating from "../utils/calculateAverageRating.js";
import { createError } from "../utils/error.js";

export const createReview = async (req, res, next)=> {
    const existingReview = await Review.findOne({
        recipeId: req.params.recipeId,
        userId: req.user.id
    });

    if(existingReview){
        return next(createError(400, "You already reviewed this recipe."))
    };

       const newReview = new Review({
          userId : req.user.id ,
          recipeId: req.params.recipeId,
          ...req.body
    });

    try{
        const savedReview = await newReview.save();
        await calcuateAverageRating(req.params.recipeId);
        res.status(201).json(savedReview);
    }catch(err){
        next(err)
    };
};

export const getReviewsByRecipeId = async (req, res, next) => {
    const { page = 1, limit = 5 } = req.query;
  
    try {
      const reviews = await Review.find({ recipeId: req.params.recipeId })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 }); 
  
      const total = await Review.countDocuments({ recipeId: req.params.recipeId });
  
      res.status(200).json({
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        reviews,
      });
    } catch (err) {
      next(err);
    }
  };

export const deleteReview = async (req, res, next)=>{
    try{
      const review = await Review.findById(req.params.id);
      if(!review)return next(createError(404, "Review not found!"))

      if(review.userId !== req.user.id && req.user.isAdmin)
        return next(createError(403, "Not authorized to delete this review!"));

      await Review.findByIdAndDelete(req.params.id);
      res.status(200).json("review deleted!")
    }catch(err){
        next(err)
    };
};


