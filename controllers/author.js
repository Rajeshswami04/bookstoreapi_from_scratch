import express from "express"
import { connectDB } from "../dbconnect/db.js"
import { Book } from "../models/Book.js";
import { Author } from "../models/Author.js";

export const addbook = async (req, res,next) => {
    try {
        await connectDB();
        const { id, author, copies, title, description, edition } = req.body;
        if (!id || !author || !title || !description) {
            return res.status(401).json({ message: 'all mandatory field are not filled ,id author title desc is needed' });
        }
        const book = new Book({
            id, author: author.trim(), copies, title: title.trim(), description: description.trim(), edition
        });
        await book.save();
        return res.status(200).json({ message: "successfully added" });
    } catch (error) {
        console.log(error);
        next(error);
    }
}
export const updatebook = async (req, res,next) => {
    try {
        await connectDB();
        const { id } = req.params; // id will be taken from params;
        const allowed = ['copies', 'title', 'description', 'edition', 'author'];
        const updated = {};
        Object.keys(req.body).forEach((key) => {
            if (allowed.includes(key)) {
                updated[key] = req.body[key];
            }
        });
        if (Object.keys(updated).length === 0) {
            return res.status(400).json({ message: 'no valid updated are there' });
        }
        const update = await Book.findOneAndUpdate({ id }, updated, { new: true, runValidators: true });
        if (!update) { return res.status(401).json({ message: "no users found" }) }
        return res.status(200).json({ message: "successfully updated data" });
    } catch (error) {
        console.log(error);
        next(error);
    }
}


export const deletebook = async (req, res,next) => {
    try {
        await connectDB();
        const { id } = req.params;
        const book = await Book.findOneAndDelete({ id });
        if (book) { return res.status(200).json({ message: 'deleted successfully' }); }
        return res.status(404).json({ message: "book not found" });
    } catch (error) {
        console.log(error)
        next(error);
    }
}

export const getbookbytitle = async (req, res,next) => {
    try {
        await connectDB();
        const title = req.query.title;
        const page = parseInt(req.params.page) || 1;
        const limit = parseInt(req.params.limit) || 10;
        const skip = (page - 1) * limit;
        // console.log(title)
        if (!title) {
            return res.status(401).json({ message: "parameter query needed bro " });}
        const book = await Book.find({ title: { $regex: title, $options: 'i' } }).skip(skip).limit(limit).sort({ createdAt: -1 });
        // console.log(book)
        if (book.length === 0) {
            return res.status(401).json({ message: "book is not found" });
        }
        const totalBooks = await Book.countDocuments();
        return res.status(200).json({
            message: "books fetched successfully", book,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalBooks / limit),
                totalItems: totalBooks,
                pageSize: limit
            }
        });

    } catch (error) {
        console.log(error)
        next(error);
    }
}

export const getallbookbyauthor = async (req, res,next) => {
    try {
        await connectDB();
        const author = req.query.author;
        const page = parseInt(req.params.page) || 1;
        const limit = parseInt(req.params.limit) || 10;
        const skip = (page - 1) * limit;
        if (!author) {
            return res.status(400).json({ message: "author is not found in parameter query" });
        }

        const books = await Book.find({ author: { $regex: author, $options: 'i' } }).skip(skip).limit(limit).sort({ createdAt: -1 });
        if (books.length === 0) {
            return res.status(401).json({ message: "book not found" });
        }

        const totalBooks = await Book.countDocuments();
        return res.json({
            books, message: "books fetched successfully",
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalBooks / limit),
                totalItems: totalBooks,
                pageSize: limit
            }
        });
    } catch (error) {
        console.log(error)
        next(error);
    }
}


export const getallbooks = async (req, res,next) => {
    try {
        await connectDB();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const books = await Book.find({}).skip(skip).limit(limit).sort({ createdAt: -1 });;
        const totalBooks = await Book.countDocuments();
        res.status(200).json({
            message: "all books fetched successfully", books,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalBooks / limit),
                totalItems: totalBooks,
                pageSize: limit
            }
        });
    } catch (error) {
        console.log(error)
        next(error);
    }
}

