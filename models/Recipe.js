import mongoose from "mongoose";

const RecipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String, 
    },
    ingredients: {
      type: [String],
      required: true,
    },
    instructions: {
      type: String, 
      required: true,
    }, 
    image: {
      type: String,
      default: "",
    },
    cloudinary_id: {
      type: String,
    },
    cookTime: {
      type: Number, 
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"], 
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
    },  
  },
  { timestamps: true }
);

export default mongoose.model("Recipe", RecipeSchema);
