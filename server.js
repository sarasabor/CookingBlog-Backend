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
  "https://cooking-blog-frontend-cftb-e9nfiipms-sarasabors-projects.vercel.app",
  "https://cooking-blog-frontend-cftb-9l9y2q9be-sarasabors-projects.vercel.app"
];

// Add FRONTEND_URL(s) from environment variables if provided
if (process.env.FRONTEND_URL) {
  const frontendUrls = process.env.FRONTEND_URL.split(',').map(url => url.trim());
  allowedOrigins.push(...frontendUrls);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow all Vercel deployments for this project
    if (origin && origin.includes('cooking-blog-frontend-cftb') && origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    // Allow all moodbitekitchen.com subdomains
    if (origin && origin.includes('moodbitekitchen.com')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Log CORS configuration for debugging
console.log('CORS allowed origins:', allowedOrigins);

// Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(helmet())

// Backend Port
const port = process.env.PORT || 5000;

// ============================================
// ROUTES CONFIGURATION (BEFORE SERVER START)
// ============================================

// Health check for Railway (MUST be first for quick response)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Backend is running",
    timestamp: new Date().toISOString()
  });
});

// Server root route
app.get("/", (req, res) => {
  res.send("Welcome from CookingBlog Backend")
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

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/reviews", reviewRoutes)
app.use("/api/upload", uploadRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use(errorHandler);

// ============================================
// DATABASE & SERVER STARTUP
// ============================================

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



