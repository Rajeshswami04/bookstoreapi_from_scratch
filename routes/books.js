import express, { Router } from "express";
import { addbook, deletebook, getallbookbyauthor, getallbooks, getbookbytitle, updatebook } from "../controllers/author.js";

const router2=express.Router();


router2.post("/add",addbook);
router2.patch("/update/:id",updatebook);
router2.delete("/delete/:id",deletebook);
router2.get("/title",getbookbytitle);
router2.get("/author",getallbookbyauthor);
router2.get("/all",getallbooks);

export default router2;