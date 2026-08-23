import mongoose  from "mongoose";
import { Book } from "./Book.js";
const Userschema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
   books: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book"
}],
    isverified:{
        type:Boolean
    },
    verificationtoken:{
        type:String,
        default:undefined
    },
    verificationtokenexpire:{
        type:Date,
        default:undefined
    },
    resetpasswordtoken:{
        type:String,
        default:undefined
    },
    resetpasswordtokenexpire:{
        type:Date,
        default:undefined
    }
},{timestamps:true});

export const Author=mongoose.model("Author",Userschema);