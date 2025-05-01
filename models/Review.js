import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
    {
        userId: {
          type: String,
          required: true,
        },
        recipeId: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          required: false,
        },
        averageRating: { type: Number, default: 0 }
      },
      { timestamps: true }
);

export default mongoose.model("Review", ReviewSchema);