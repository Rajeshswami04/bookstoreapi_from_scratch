# Bookstore API

A REST API for managing books and authors, built with Node.js, Express, MongoDB, and Mongoose. Authentication uses JWTs stored in secure, HTTP-only cookies.

## Features

- Author registration and login
- Cookie-based JWT authentication
- Password reset token flow
- Create, update, delete, search, and list books
- Pagination for book listings
- Helmet security headers, JSON parsing, and centralized error responses

## Requirements

- Node.js 18 or newer
- MongoDB database, local or hosted

## Installation

```bash
git clone <repository-url>
cd bookstoreapi
npm install
```

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb://127.0.0.1:27017/bookstore
JWT_SECRET=replace-with-a-long-random-secret
PORT=3000
NODE_ENV=development
```

`MONGO_URI` and `JWT_SECRET` are required. `PORT` is read by the server when it starts.

## Running the API

```bash
# Production-style start
npm start

# Development mode with automatic restart
npm run dev
```

The API is available at `http://localhost:3000` when `PORT=3000`.

## Authentication

Successful signup and login responses set a `token` cookie. Send that cookie with subsequent requests. The cookie is HTTP-only, expires after seven days, and is marked secure in production.

### Auth endpoints

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | No | Create an author account |
| `POST` | `/api/auth/login` | No | Log in and receive a token cookie |
| `GET` | `/api/auth/checkauth` | Cookie | Return the current author |
| `POST` | `/api/auth/logout` | No | Clear the token cookie |
| `POST` | `/api/auth/forgotpassword` | No | Generate a password reset token |
| `POST` | `/api/auth/resetpassword/:token` | No | Set a new password |

#### Signup

```http
POST /api/auth/signup
Content-Type: application/json

{
	"name": "Ada Lovelace",
	"email": "ada@example.com",
	"password": "strong-password"
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
	"email": "ada@example.com",
	"password": "strong-password"
}
```

For command-line clients, preserve the cookie returned by login:

```bash
curl -i -c cookies.txt -H "Content-Type: application/json" \
	-d '{"email":"ada@example.com","password":"strong-password"}' \
	http://localhost:3000/api/auth/login

curl -b cookies.txt http://localhost:3000/api/auth/checkauth
```

#### Password reset

Request a reset token:

```http
POST /api/auth/forgotpassword
Content-Type: application/json

{ "email": "ada@example.com" }
```

Then submit the returned token:

```http
POST /api/auth/resetpassword/<token>
Content-Type: application/json

{ "npassword": "new-strong-password" }
```

Reset tokens expire after one hour. In the current implementation, the token is returned directly in the response; a production application should deliver it through a trusted email service instead.

## Book endpoints

The book router is mounted at `/book`. Book endpoints currently do not require the authentication middleware.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/book/add` | Add a book |
| `PATCH` | `/book/update/:id` | Update allowed book fields |
| `DELETE` | `/book/delete/:id` | Delete a book |
| `GET` | `/book/all?page=1&limit=10` | List all books |
| `GET` | `/book/title?title=javascript` | Find books by title |
| `GET` | `/book/author?author=ada` | Find books by author |

### Add a book

```http
POST /book/add
Content-Type: application/json

{
	"id": "book-001",
	"author": "Ada Lovelace",
	"title": "Algorithms for Beginners",
	"description": "An introduction to algorithms.",
	"copies": 4,
	"edition": 1
}
```

Required fields are `id`, `author`, `title`, and `description`. `copies` defaults to `1`, and `edition` defaults to `1`.

### Update a book

```http
PATCH /book/update/book-001
Content-Type: application/json

{
	"copies": 6,
	"edition": 2
}
```

Allowed update fields are `copies`, `title`, `description`, `edition`, and `author`.

### List and search response

Successful list and search responses include a `pagination` object:

```json
{
	"pagination": {
		"currentPage": 1,
		"totalPages": 3,
		"totalItems": 25,
		"pageSize": 10
	}
}
```

Searches are case-insensitive and match partial titles or author names. Search endpoints default to page `1` and limit `10`; the all-books endpoint accepts `page` and `limit` as query parameters.

## Project structure

```text
index.js                         Express app and server startup
controllers/                     Request handlers
dbconnect/db.js                  MongoDB connection
middleware/verifyToken.js        JWT cookie middleware
models/                          Mongoose schemas
routes/                          Auth and book routes
utils/generateTokenAndSetCookie.js
																 JWT creation and cookie settings
```

## Error responses

Validation and authentication errors return JSON with a `message` field. Unhandled errors use this shape:

```json
{
	"success": false,
	"message": "Error message"
}
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the API with Node.js |
| `npm run dev` | Start the API with Nodemon |

## License

This project is licensed under the ISC license.
