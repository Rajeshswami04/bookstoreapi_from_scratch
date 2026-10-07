import express from  "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import router1 from "./routes/authors.js"
import router2 from "./routes/books.js"
import { connectDB } from "./dbconnect/db.js";
import mongoSanitize from "express-mongo-sanitize"
import rateLimit from "express-rate-limit";
const app=express();
dotenv.config();
app.use(express.json());
app.use(helmet());
app.use(cookieParser());
app.use(mongoSanitize());//ingetion...
app.use("/api/auth",router1);
app.use("/book",router2);


//used snippet
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,                // Limit each IP to 100 requests per window
  standardHeaders: 'draft-7', // Return standard rate limit info in headers
  legacyHeaders: false,      // Disable the X-RateLimit-* headers
  message: 'Too many requests, please try again later.',
});
// Apply the rate limiting middleware to all requests
//referenced from docs

app.use(limiter);

//midllware for globle error handling 
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'internal server srror',
  };
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }
  res.status(statusCode).json(response);
});

const start = async () => {
    try {
        await connectDB();
        app.listen(process.env.PORT, () => {
            console.log(`API listening on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Unable to connect to MongoDB", error);
        process.exit(1);
    }
};

start();