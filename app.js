const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = process.env.PORT || 3001;

const supabaseUrl = "https://fudsrzbhqpmryvmxgced.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag";
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, 'public/signup.html')));

// Handle user login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Authenticate the user with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        return res.send("Invalid email or password");
    }

    res.send("Login successful!"); // You can redirect or handle the login success here
});

// Handle user signup
app.post("/signup", async (req, res) => {
    const { username, email, password, "confirm-password": confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.send("Passwords do not match");
    }

    // Register the user with Supabase Auth
    const { user, session, error } = await supabase.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        return res.send("Signup failed");
    }

    // Store additional user information in Supabase
    const { data, insertError } = await supabase
        .from('users') // Replace 'users' with your actual table name
        .insert([
            { id: user.id, username: username, email: email }
        ]);

    if (insertError) {
        return res.send("Signup failed");
    }

    res.send("Signup successful!"); // You can redirect or handle the signup success here
});

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
