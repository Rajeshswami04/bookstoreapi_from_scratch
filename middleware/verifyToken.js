import jwt from "jsonwebtoken"


export const verifyToken=async(req ,res, next)=>{
    try {
        const token=req.cookies.token;
        if(!token){
            return res.status(401).json({success:false, message:"user is unauthorized no token exits "})
        }
        const encoded=jwt.verify(token,process.env.JWT_SECRET);
        req.userId=encoded.userId;
        next()
    } catch (error) {
        console.log("error in verification in token");
        return res.status(401).json({success:false,message:"invalid or expired token"});
    }
}