import { query } from "../dbconnect/db.js";

const authorColumns = `
    id AS _id,
    name,
    email,
    password,
    isverified,
    verificationtoken,
    verificationtokenexpire,
    resetpasswordtoken,
    resetpasswordtokenexpire,
    createdAt,
    updatedAt
`;

export const Author = {
    async findByEmail(email) {
        const authors = await query(
            `SELECT ${authorColumns} FROM authors WHERE email = ? LIMIT 1`,
            [email]
        );
        return authors[0] || null;
    },

    async create({ email, password, name }) {
        const result = await query(
            "INSERT INTO authors (email, password, name) VALUES (?, ?, ?)",
            [email, password, name]
        );
        const authors = await query(
            `SELECT ${authorColumns} FROM authors WHERE id = ?`,
            [result.insertId]
        );
        return authors[0];
    },

    async setPasswordResetToken(email, token, expiresAt) {
        await query(
            "UPDATE authors SET resetpasswordtoken = ?, resetpasswordtokenexpire = ? WHERE email = ?",
            [token, expiresAt, email]
        );
    },

    async findByValidResetToken(token, now) {
        const authors = await query(
            `SELECT ${authorColumns} FROM authors
             WHERE resetpasswordtoken = ? AND resetpasswordtokenexpire > ?
             LIMIT 1`,
            [token, now]
        );
        return authors[0] || null;
    },

    async updatePasswordAndClearResetToken(id, password) {
        await query(
            `UPDATE authors
             SET password = ?, resetpasswordtoken = NULL, resetpasswordtokenexpire = NULL
             WHERE id = ?`,
            [password, id]
        );
    },

    async findByIdWithoutPassword(id) {
        const authors = await query(
            `SELECT id AS _id, name, email, isverified, verificationtoken,
                    verificationtokenexpire, resetpasswordtoken,
                    resetpasswordtokenexpire, createdAt, updatedAt
             FROM authors WHERE id = ? LIMIT 1`,
            [id]
        );
        return authors[0] || null;
    }
};
