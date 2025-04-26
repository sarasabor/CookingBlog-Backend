import express, { json } from "express";
import dotenv, { configDotenv } from "dotenv";
import userRoute from "./routes/userRoute.js";
import productRoutes from "./routes/productRoutes.js";
import mongoose from "mongoose";
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();

// Starting Server
const app = express();


// Middlewares
app.use(express.json())


// Backend Port
const port = process.env.PORT || 5000;

// Connect to database

const mongoUrl = process.env.MONGO

const connectToDatabase = async () => {
    try {
      await mongoose.connect(mongoUrl); 
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


app.listen(port, ()=>{
    console.log(`Server is running on port: ${port}`);
});


app.use("/api/user", userRoute)
app.use("/api/products", productRoutes);


app.use(errorHandler);
