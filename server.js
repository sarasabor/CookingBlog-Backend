import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import mongoose from "mongoose";
import errorHandler from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import uploadRoutes from "./routes/uploadRoutes.js";
import cors from "cors";

dotenv.config();

// Starting Server
const app = express();

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost and Vercel domains
    const allowedOrigins = [
      "http://localhost:5173",
      "https://localhost:5173"
    ];
    
    if (allowedOrigins.includes(origin) || 
        origin.includes('vercel.app') || 
        origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true, 
}));

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

// Backend Port (Koyeb uses 8000 by default)
const port = process.env.PORT || 8000;

// Connect to database
const mongoUrl = process.env.MONGO;

const connectToDatabase = async () => {
    try {
     const connectedDb = await mongoose.connect(mongoUrl); 
     if (connectedDb) {
        console.log('Connected to MongoDB');
        app.listen(port, () => {
            console.log(`Server is running on port: ${port}`);
        });
     }
    } catch (err) {
      console.log('Error connecting to MongoDB:', err);
    }
  };

connectToDatabase();

// Server route
app.get("/", (req , res)=>{
    res.send("Welcome from Backend")
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});


app.use(errorHandler);



