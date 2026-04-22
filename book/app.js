const express = require('express');
const methodoverride = require('method-override');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "localhost";

app.use(methodoverride("_method"));

app.set('view engine', "ejs");
app.set("views", path.join(__dirname, "views"));

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, "access.log"),
    { flags: "a" }
);

app.use(morgan("combined", { stream: accessLogStream }));

app.use((req, _res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} request for '${req.url}'`);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

let Books = [
    { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
    { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee" },
    { id: 3, title: "1984", author: "George Orwell" },
    { id: 4, title: "Pride and Prejudice", author: "Jane Austen" },
    { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger" },
    { id: 6, title: "The Lord of the Rings", author: "J.R.R. Tolkien" },
    { id: 7, title: "The Hobbit", author: "J.R.R. Tolkien" },
    { id: 8, title: "Harry Potter and the Philosopher's Stone", author: "J.K. Rowling" }
];;

app.get("/", (req, res) => {
    try {
        const searchQuery = req.query.searchQuery
            ? req.query.searchQuery.trim().toLowerCase()
            : "";

        const filterBooks = Books.filter(
            (book) =>
                book.title.toLowerCase().includes(searchQuery) ||
                book.author.toLowerCase().includes(searchQuery)
        );

        res.render("index", {
            title: "Books",
            filterBooks,
            searchQuery,
            error: null,
        });
    } catch {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.delete("/books/:id", (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const book = Books.find((b) => b.id === id);

        if (!book) {
            return res.render("index", {
                error: "Book not found",
                filterBooks: Books,
                searchQuery: "",
            });
        }

        Books = Books.filter((b) => b.id !== id);
        res.redirect("/");
    } catch {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/books/:id/edit", (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const book = Books.find((b) => b.id === id);

        if (!book) {
            return res.render("form", { error: "Book not found", Book: null });
        }

        res.render("form", { Book: book, error: null });
    } catch {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.put("/books/:id", (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const book = Books.find((b) => b.id === id);

        if (!book) {
            return res.render("form", { error: "Book not found", Book: null });
        }

        book.title = req.body.title;
        book.author = req.body.author;

        res.redirect("/");
    } catch {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, HOST, () => {
    console.log(`Server is running at http://${HOST}:${PORT}`);
});