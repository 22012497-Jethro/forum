const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const postsRouter = require('./routes/posts'); // Import the posts router
const usersRouter = require('./routes/users'); // Import the users router
const commentsRouter = require('./routes/comments'); // Import the comments router
const messagesRouter = require('./routes/messages'); // Import the comments router
const authenticateUser = require('./middleware/authMiddleware'); // Import the auth middleware

const app = express();
const port = process.env.PORT || 3001;

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session middleware
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

// Apply the auth middleware to all routes that require authentication
app.get("/main", authenticateUser, (req, res) => res.sendFile(path.join(__dirname, 'public/main.html')));
app.get('/create-post', authenticateUser, (req, res) => res.sendFile(path.join(__dirname, 'public', 'create-post.html')));
app.get("/single-post", authenticateUser, (req, res) => res.sendFile(path.join(__dirname, 'public', 'single-post.html')));
app.get("/post", authenticateUser, (req, res) => res.sendFile(path.join(__dirname, 'public/post.html')));
app.get("/edit", authenticateUser, (req, res) => res.sendFile(path.join(__dirname, 'public/edit.html')));
app.get("/message", authenticateUser, (req, res) => res.sendFile(path.join(__dirname, 'public/message.html')));
app.get("/settings", authenticateUser, (req, res) => res.sendFile(path.join(__dirname, 'public/settings.html')));
app.get("/profile", authenticateUser, (req, res) => res.sendFile(path.join(__dirname, 'public/profile.html')));

// Use the posts and users routers with authentication
app.use('/posts', authenticateUser, postsRouter);
app.use('/comments', authenticateUser, commentsRouter);
app.use('/messages', authenticateUser, messagesRouter);

// Use the users router without authentication for login and signup
app.use('/users', usersRouter);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
