const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require('express-session');
const postsRouter = require('./routes/posts'); // Import the posts router
const usersRouter = require('./routes/users'); // Import the users router

const app = express();
const port = process.env.PORT || 3001;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Configure body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files for the frontend
app.get("/", (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, 'public/signup.html')));
app.get("/main", (req, res) => res.sendFile(path.join(__dirname, 'public/main.html')));

// Use the posts and users routers
app.use('/posts', postsRouter);
app.use('/users', usersRouter);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
