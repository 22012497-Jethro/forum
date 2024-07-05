const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = process.env.PORT || 3001;

const supabaseUrl = "https://your-supabase-url.supabase.co";
const supabaseKey = "your-supabase-api-key";
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));

// Handle user login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // Authenticate the user with Supabase Auth
    const { user, session, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password
    });

    if (error) {
        return res.send("Invalid username or password");
    }

    res.send("Login successful!"); // You can redirect or handle the login success here
});

// Handle user signup
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    // Register the user with Supabase Auth
    const { user, session, error } = await supabase.auth.signUp({
        email: username,
        password: password
    });

    if (error) {
        return res.send("Signup failed");
    }

    res.send("Signup successful!"); // You can redirect or handle the signup success here
});

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
