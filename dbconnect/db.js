import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();



let pool;
let schemaPromise;

const createPool = () => {
    const { MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE } = process.env;
    if (!MYSQLHOST || !MYSQLUSER || !MYSQLDATABASE) {
        throw new Error("MYSQLHOST, MYSQLUSER, and MYSQLDATABASE must be configured");
    }

    return mysql.createPool({
        host: MYSQLHOST,
        port: Number(process.env.MYSQL_PORT) || 3306,
        user: MYSQLUSER,
        password: MYSQLPASSWORD || "",
        database: MYSQLDATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
};

export const connectDB = async () => {
    if (!pool) {
        pool = createPool();
    }

    if (!schemaPromise) {
        schemaPromise = (async () => {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS authors (
                    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(320) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    isverified BOOLEAN NOT NULL DEFAULT FALSE,
                    verificationtoken VARCHAR(255) NULL,
                    verificationtokenexpire DATETIME(3) NULL,
                    resetpasswordtoken VARCHAR(255) NULL,
                    resetpasswordtokenexpire DATETIME(3) NULL,
                    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
                )
            `);
            await pool.query(`
                CREATE TABLE IF NOT EXISTS books (
                    id VARCHAR(191) NOT NULL PRIMARY KEY,
                    author VARCHAR(255) NOT NULL,
                    copies INT NOT NULL DEFAULT 1,
                    title VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    edition INT NOT NULL DEFAULT 1,
                    createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                    updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                    INDEX books_title_idx (title),
                    INDEX books_author_idx (author)
                )
            `);
            console.log("connected successfully to MySQL");
        })();
    }

    try {
        await schemaPromise;
    } catch (error) {
        schemaPromise = undefined;
        throw error;
    }
};

export const query = async (sql, values = []) => {
    await connectDB();
    const [rows] = await pool.execute(sql, values);
    return rows;
};
