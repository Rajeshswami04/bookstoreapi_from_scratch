import express from "express";
import { checkAuth, forgotpassword, login, logout, resetpassword, signin } from "../controllers/auth.js";
import { verifyToken } from "../middleware/verifyToken.js";



const router1=express.Router();

router1.get("/checkauth",verifyToken,checkAuth);
router1.post("/signup",signin)
router1.post("/login",login)
router1.post("/forgotpassword",forgotpassword)
router1.post("/logout",logout)
router1.post("/resetpassword/:token",resetpassword)


export default router1;