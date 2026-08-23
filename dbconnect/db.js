import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config();


export const connectDB=async ()=> {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not configured");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected successfully");
}
