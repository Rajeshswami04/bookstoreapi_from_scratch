import jwt from "jsonwebtoken"

//here userid as a payloader

export const generateTokenAndSetCookie=(res,userId)=>{
    const token=jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"7d",

    })   
    res.cookie("token",token,
        {
        httpOnly:true,//javascript can not access it by document.cookie
        secure:process.env.NODE_ENV=="production",
        sameSite:"strict",//csrf
        maxAge:7*24*60*60*1000,
        }
) 
    return token;
}