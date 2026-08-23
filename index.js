import express from  "express";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import router1 from "./routes/authors.js"
import router2 from "./routes/books.js"
import { connectDB } from "./dbconnect/db.js";
const app=express();
dotenv.config();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",router1)
app.use("/book",router2)





const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,                // Limit each IP to 100 requests per window
  standardHeaders: 'draft-7', // Return standard rate limit info in headers
  legacyHeaders: false,      // Disable the X-RateLimit-* headers
  message: 'Too many requests from this IP, please try again later.',
});
// Apply the rate limiting middleware to all requests
//referenced from docs




app.use(limiter);
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