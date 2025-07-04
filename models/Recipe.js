import mongoose from "mongoose";

const IngredientSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true },
      fr: { type: String, required: true },
      ar: { type: String, required: true },
    },
    quantity: { type: String, default: "" },
  },
  { _id: false } 
);

const RecipeSchema = new mongoose.Schema(
  {
    title: {
      en: { type: String, required: true },
      fr: { type: String, required: true },
      ar: { type: String, required: true },
    },
    ingredients: {
      type: [IngredientSchema],
      required: true,
    },
    instructions: {
      en: { type: String, required: true },
      fr: { type: String, required: true },
      ar: { type: String, required: true },
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
    mood: {
      type: String,
      enum: [
        "hungry",
        "sad",
        "stressed",
        "tired",
        "relaxed",
        "happy",
        "bored",
        "romantic",
        "anxious",
        "energetic",
      ],
      default: "hungry",
    },
    tags: {
      type: [String],
      default: [],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        value: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: {
          type: String,
          default: "",
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Recipe", RecipeSchema);
