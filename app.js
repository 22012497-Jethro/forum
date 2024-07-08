const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const postsRouter = require('./routes/posts'); // Import the posts router
const usersRouter = require('./routes/users'); // Import the users router

const app = express();
const port = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files for the frontend
app.get("/", (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, 'public/signup.html')));
app.get("/main", (req, res) => res.sendFile(path.join(__dirname, 'public/main.html')));

// Use the posts and users routers
app.use(postsRouter);
app.use(usersRouter);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
