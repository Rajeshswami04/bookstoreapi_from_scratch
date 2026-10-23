import { query } from "../dbconnect/db.js";

const bookColumns = "id, author, copies, title, description, edition, createdAt, updatedAt";

export const Book = {
    async create({ id, author, copies = 1, title, description, edition = 1 }) {
        await query(
            "INSERT INTO books (id, author, copies, title, description, edition) VALUES (?, ?, ?, ?, ?, ?)",
            [id, author, copies, title, description, edition]
        );
    },

    async updateById(id, updates) {
        const columns = {
            copies: "copies",
            title: "title",
            description: "description",
            edition: "edition",
            author: "author"
        };
        const entries = Object.entries(updates).filter(([key]) => columns[key]);
        if (entries.length === 0) {
            return false;
        }

        const assignments = entries.map(([key]) => `${columns[key]} = ?`).join(", ");
        const result = await query(
            `UPDATE books SET ${assignments} WHERE id = ?`,
            [...entries.map(([, value]) => value), id]
        );
        if (result.affectedRows > 0) {
            return true;
        }
        const books = await query("SELECT id FROM books WHERE id = ? LIMIT 1", [id]);
        return books.length > 0;
    },

    async deleteById(id) {
        const result = await query("DELETE FROM books WHERE id = ?", [id]);
        return result.affectedRows > 0;
    },

    async findByTitle(title, limit, offset) {
        return query(
            `SELECT ${bookColumns} FROM books WHERE LOWER(title) LIKE LOWER(?)
             ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
            [`%${title}%`, limit, offset]
        );
    },

    async findByAuthor(author, limit, offset) {
        return query(
            `SELECT ${bookColumns} FROM books WHERE LOWER(author) LIKE LOWER(?)
             ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
            [`%${author}%`, limit, offset]
        );
    },

    async findAll(limit, offset) {
        return query(
            `SELECT ${bookColumns} FROM books
             ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );
    },

    async countByTitle(title) {
        const rows = await query(
            "SELECT COUNT(*) AS total FROM books WHERE LOWER(title) LIKE LOWER(?)",
            [`%${title}%`]
        );
        return rows[0].total;
    },

    async countByAuthor(author) {
        const rows = await query(
            "SELECT COUNT(*) AS total FROM books WHERE LOWER(author) LIKE LOWER(?)",
            [`%${author}%`]
        );
        return rows[0].total;
    },

    async countAll() {
        const rows = await query("SELECT COUNT(*) AS total FROM books");
        return rows[0].total;
    }
};
