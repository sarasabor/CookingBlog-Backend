import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
      },
      email: { 
        type: String, 
        required: true, 
        unique: true 
      },
      password: {
        type: String,
        required: true,
      },
      isAdmin: {
        type: Boolean,
        default: false
      },

      role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
      },
      favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
     
    }, { timestamps: true});

export default mongoose.model("User", userSchema);