import express, { json } from "express";
import dotenv, { configDotenv } from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import productRoutes from "./routes/productRoutes.js";
import mongoose from "mongoose";
import errorHandler from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";


dotenv.config();

// Starting Server
const app = express();


// Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(helmet())

// Backend Port
const port = process.env.PORT || 5000;

// Connect to database

const mongoUrl = process.env.MONGO

const connectToDatabase = async () => {
    try {
     const connectedDb = await mongoose.connect(mongoUrl); 
     if (connectedDb) {app.listen(port, ()=>{
    console.log(`Server is running on port: ${port}`);
});};
      console.log('Connected to MongoDB');
    } catch (err) {
      console.log('Error connecting to MongoDB:', err);
    }
  };

connectToDatabase();

// Server route
app.get("/", (req , res)=>{
    res.send("Welcome from Backend")
});

app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes)
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});


app.use(errorHandler);


