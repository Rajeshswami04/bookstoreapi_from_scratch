import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { connectDB } from "../dbconnect/db.js";
import { Author } from "../models/Author.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";

export const login = async (req, res, next) => {
    try {
        await connectDB();
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "all field required" });
        }
        const author = await Author.findByEmail(email);
        if (!author) {
            return res.status(400).json({ message: "user not exits" });
        }
        const auth = await bcryptjs.compare(password, author.password);
        if (!auth) {
            return res.status(400).json({ message: "something went wrong" });
        }
        generateTokenAndSetCookie(res, author._id);
        return res.status(200).json({ message: "logged in successfully" });
    } catch (error) {
        next(error);
    }
};

export const signin = async (req, res, next) => {
    try {
        await connectDB();
        const { email, name, password } = req.body;
        if (!email || !name || !password) {
            return res.status(400).json({ message: "all field are required" });
        }
        const author = await Author.findByEmail(email);
        if (author) {
            return res.status(400).json({ message: "user already exits" });
        }
        const hashedPassword = await bcryptjs.hash(password, 10);
        const newAuthor = await Author.create({ email, password: hashedPassword, name });
        generateTokenAndSetCookie(res, newAuthor._id);
        return res.status(200).json({ message: "successfully signed" });
    } catch (error) {
        next(error);
    }
};

export const forgotpassword = async (req, res, next) => {
    try {
        await connectDB();
        const { email } = req.body;
        if (!email) {
            return res.status(401).json({ message: "please provide email for sending link" });
        }
        const user = await Author.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: "user does not exits" });
        }
        const token = crypto.randomBytes(20).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await Author.setPasswordResetToken(email, token, expiresAt);
        return res.status(200).json({ token });
    } catch (error) {
        next(error);
    }
};

export const resetpassword = async (req, res, next) => {
    try {
        await connectDB();
        const { npassword } = req.body;
        const { token } = req.params;
        if (!npassword) {
            return res.status(400).json({ message: "new password is required" });
        }
        const user = await Author.findByValidResetToken(token, new Date());
        if (!user) {
            return res.status(400).json({ message: "something went wrong" });
        }
        const hashedPassword = await bcryptjs.hash(npassword, 10);
        await Author.updatePasswordAndClearResetToken(user._id, hashedPassword);
        return res.status(200).json({ message: "password successfully changed" });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        res.clearCookie("token");
        return res.json({ success: true, message: "logged out successfully" });
    } catch (error) {
        next(error);
    }
};

export const checkAuth = async (req, res, next) => {
    try {
        await connectDB();
        const user = await Author.findByIdWithoutPassword(req.userId);
        if (!user) {
            return res.status(401).json({ message: "user does not exits" });
        }
        return res.status(200).json({ message: "user exits", user });
    } catch (error) {
        next(error);
    }
};
