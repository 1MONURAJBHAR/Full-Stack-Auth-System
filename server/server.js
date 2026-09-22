import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/config.js";
import authRouter from "./router/authRoutes.js";
import userRouter from "./router/userRoutes.js";



dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

//Connect database
connectDB()


// ✅ Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // set your frontend URL
    credentials: true,
  }),
);

// API Endpoints
app.get("/", (req, res) => {
  res.send("✅ API is working successfully!");
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
