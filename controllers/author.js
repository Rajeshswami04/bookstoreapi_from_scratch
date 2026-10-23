import { connectDB } from "../dbconnect/db.js";
import { Book } from "../models/Book.js";

const getPagination = (req) => {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Number.parseInt(req.query.limit, 10) || 10);
    return { page, limit, offset: (page - 1) * limit };
};

const paginationResponse = (page, limit, totalItems) => ({
    currentPage: page,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
    pageSize: limit
});

export const addbook = async (req, res, next) => {
    try {
        await connectDB();
        const { id, author, copies, title, description, edition } = req.body;
        if (!id || !author || !title || !description) {
            return res.status(401).json({ message: "all mandatory field are not filled ,id author title desc is needed" });
        }
        await Book.create({
            id,
            author: author.trim(),
            copies,
            title: title.trim(),
            description: description.trim(),
            edition
        });
        return res.status(200).json({ message: "successfully added" });
    } catch (error) {
        next(error);
    }
};

export const updatebook = async (req, res, next) => {
    try {
        await connectDB();
        const { id } = req.params;
        const allowed = ["copies", "title", "description", "edition", "author"];
        const updates = Object.fromEntries(
            Object.entries(req.body).filter(([key]) => allowed.includes(key))
        );
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "no valid updated are there" });
        }
        const updated = await Book.updateById(id, updates);
        if (!updated) {
            return res.status(401).json({ message: "no users found" });
        }
        return res.status(200).json({ message: "successfully updated data" });
    } catch (error) {
        next(error);
    }
};

export const deletebook = async (req, res, next) => {
    try {
        await connectDB();
        const deleted = await Book.deleteById(req.params.id);
        if (deleted) {
            return res.status(200).json({ message: "deleted successfully" });
        }
        return res.status(404).json({ message: "book not found" });
    } catch (error) {
        next(error);
    }
};

export const getbookbytitle = async (req, res, next) => {
    try {
        await connectDB();
        const { title } = req.query;
        if (!title) {
            return res.status(401).json({ message: "parameter query needed bro " });
        }
        const { page, limit, offset } = getPagination(req);
        const [book, totalBooks] = await Promise.all([
            Book.findByTitle(title, limit, offset),
            Book.countByTitle(title)
        ]);
        if (book.length === 0) {
            return res.status(401).json({ message: "book is not found" });
        }
        return res.status(200).json({
            message: "books fetched successfully",
            book,
            pagination: paginationResponse(page, limit, totalBooks)
        });
    } catch (error) {
        next(error);
    }
};

export const getallbookbyauthor = async (req, res, next) => {
    try {
        await connectDB();
        const { author } = req.query;
        if (!author) {
            return res.status(400).json({ message: "author is not found in parameter query" });
        }
        const { page, limit, offset } = getPagination(req);
        const [books, totalBooks] = await Promise.all([
            Book.findByAuthor(author, limit, offset),
            Book.countByAuthor(author)
        ]);
        if (books.length === 0) {
            return res.status(401).json({ message: "book not found" });
        }
        return res.json({
            books,
            message: "books fetched successfully",
            pagination: paginationResponse(page, limit, totalBooks)
        });
    } catch (error) {
        next(error);
    }
};

export const getallbooks = async (req, res, next) => {
    try {
        await connectDB();
        const { page, limit, offset } = getPagination(req);
        const [books, totalBooks] = await Promise.all([
            Book.findAll(limit, offset),
            Book.countAll()
        ]);
        return res.status(200).json({
            message: "all books fetched successfully",
            books,
            pagination: paginationResponse(page, limit, totalBooks)
        });
    } catch (error) {
        next(error);
    }
};
