import Recipe from "../models/Recipe.js";
import Review from "../models/Review.js";

//Calc Average Rating
const calcuateAverageRating = async(recipeId)=>{
    const reviews = await Review.find({recipeId});

    if (reviews.length === 0){
        await Recipe.findByIdAndUpdate(recipeId, {averageRating: 0});
        return;
    };

    const total = reviews.reduce((sum,review)=> sum + review.rating, 0 );

    const average = total / reviews.length;

    await Recipe.findByIdAndUpdate(recipeId,{
        averageRating: parseFloat(average.toFixed(1))
    });
};

export default calcuateAverageRating;