import express, { json } from "express";
import dotenv, { configDotenv } from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import productRoutes from "./routes/productRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js"
import mongoose from "mongoose";
import errorHandler from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import uploadRoutes from "./routes/uploadRoutes.js";
import cors from "cors";

dotenv.config();

// Starting Server
const app = express();

// CORS configuration for Railway
const allowedOrigins = [
  "http://localhost:5173",
  "https://www.moodbitekitchen.com",
  "https://moodbitekitchen.com",
  "https://cooking-blog-frontend-cftb-e9nfiipms-sarasabors-projects.vercel.app"
];

// Add FRONTEND_URL(s) from environment variables if provided
if (process.env.FRONTEND_URL) {
  const frontendUrls = process.env.FRONTEND_URL.split(',').map(url => url.trim());
  allowedOrigins.push(...frontendUrls);
}

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
}));

// Log CORS configuration for debugging
console.log('CORS allowed origins:', allowedOrigins);

// Debug middleware for CORS
app.use((req, res, next) => {
  console.log('Request origin:', req.headers.origin);
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  next();
});

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
    console.log('Connected to MongoDB');
    return connectedDb;
  } catch (err) {
    console.log('Error connecting to MongoDB:', err);
    throw err;
  }
};

// Start server after database connection
const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${port}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Server routes
app.get("/", (req, res) => {
  res.send("Welcome from CookingBlog Backend")
});

// Health check for Railway
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend is running",
    timestamp: new Date().toISOString()
  });
});

// API info endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "CookingBlog API",
    version: "1.0.0",
    endpoints: [
      "/api/auth",
      "/api/products",
      "/api/users",
      "/api/recipes",
      "/api/reviews",
      "/api/upload",
      "/api/health"
    ]
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/reviews", reviewRoutes)
app.use("/api/upload", uploadRoutes);
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});


app.use(errorHandler);



