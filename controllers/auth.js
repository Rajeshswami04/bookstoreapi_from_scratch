import bcryptjs from "bcryptjs";
import crypto from "crypto";
import express from "express";
import { connectDB } from "../dbconnect/db.js";
import { Author } from "../models/Author.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
export const login=async(req,res)=>{
    try {
        await connectDB();
        const {email,password}=req.body;
        if(!email||!password){
            return res.status(400).json({message:"all field required"});
        }
        const author =await Author.findOne({email});
        if(!author){
            return res.status(400).json({message:"user not exits"});
        }
        const auth=await bcryptjs.compare(password,author.password);
        if(!auth){
            return res.status(400).json({message:"something went wrong"});
        }
        generateTokenAndSetCookie(res,author._id);
        return res.status(200).json({message:"logged in successfully"});
    } catch (error) {
        console.log("errror in login");
        return res.json({message:"error in login"});
    }
}
export const signin=async(req,res)=>{
    try {
        await connectDB();
        const {email,name,password}=req.body;
        if(!email||!name||!password)return res.status(400).json({message:"all field are required"});
        const author=await Author.findOne({email});
        if(author){
            return res.status(400).json({message:"user already exits"});
        }
        const hashedpassword=await bcryptjs.hash(password,10);
        const authorr=new Author({
            email,password:hashedpassword,name
        });
        await authorr.save();
        generateTokenAndSetCookie(res,authorr._id)
        return res.status(200).json({message:"successfully signed"});
    } catch (error) {
        console.log("error in sign up");
        console.log(error)
        return res.status(500).json({message:"internal server error"})
    }
}


// export const verifyemail=async(req,res)=>{
//     try {

//     } catch (error) {
        
//     }
// }


export const forgotpassword=async(req,res)=>{
    try {
        await connectDB();
        const {email}=req.body;
        if(!email){
            return res.status(401).json({message:"please provide email for sending link"});
        }
        const user =await Author.findOne({email});
        if(!user){
            return res.status(401).json({message:"user does not exits"});
        }
        user.resetpasswordtoken=crypto.randomBytes(20).toString("hex");
        user.resetpasswordtokenexpire=Date.now()+1*60*60*1000;
        await user.save();
        return res.status(200).json({token:user.resetpasswordtoken});
    } catch (error) {
        console.log(error)
        console.log("error in forgot passoword controller");
        return res.status(500).json({message:"internal server error"});
    }
}

export const resetpassword=async(req,res)=>{
    try {
    await connectDB();
    const {npassword}=req.body;
    const {token}=req.params;    
    if(!npassword){
        return res.status(400).json({message:"new password is required"});
    }
    console.log(token)
    const user=await Author.findOne({
        resetpasswordtoken:token,
        resetpasswordtokenexpire:{$gt:Date.now()}
    });
    if(!user){
        return res.status(400).json({message:"something went wrong"});
    }
    user.resetpasswordtoken=undefined
    user.resetpasswordtokenexpire=undefined
    const hashedpassword=await bcryptjs.hash(npassword,10);
    user.password=hashedpassword;
    await user.save();
    return res.status(200).json({message:"password successfully changed"});
    } catch (error) {
        console.log(error);
        console.log("error in reset password");
        return res.status(500).json({message:"internal server error"});
    }
}

export const logout=async(req,res)=>{
    try {
        res.clearCookie("token");
        return res.json({success:true,message:"logged out successfully"});
    } catch (error) {
        console.log("error in logging");
        return res.json({message:"error in logging"});
    }
}

export const checkAuth=async(req,res)=>{
    try {
        await connectDB();
        const user=await Author.findById(req.userId).select("-password");
        if(!user){
            return res.status(401).json({message:"user does not exits"});
        }
        return res.status(200).json({message:"user exits",user});
    } catch (error) {
        return res.status(500).json({message:"internal server error"});
    }
}