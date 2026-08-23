import express from "express"
import mongoose from "mongoose"
import { Author } from "./Author.js"

const BookSchema=new mongoose.Schema({
    id:{
        type:String,
        unique:true,
    },
    author:{
        type:String,
        ref:"Author",
    },
    copies:{
        type:Number,
        default:1
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    edition:{
        type:Number,
        default:1
    }
},{timestamps:true});


export const Book=mongoose.model("Book",BookSchema);