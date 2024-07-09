const express = require("express");
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const saltRounds = 10; // Number of salt rounds for bcrypt

// Supabase URL and API Key
const supabaseUrl = 'https://fudsrzbhqpmryvmxgced.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag';
const supabase = createClient(supabaseUrl, supabaseKey);


// User registration endpoint
router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send("All fields are required");
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const { data, error } = await supabase
            .from('users')
            .insert([{ username, email, password: hashedPassword }]);

        if (error) {
            console.error("Error creating user:", error);
            return res.status(500).send("Error creating user");
        }

        res.redirect("/login");
    } catch (err) {
        console.error("Error hashing password:", err);
        res.status(500).send("Internal server error");
    }
});

// Login endpoint
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    console.log("Login request received:", { email, password });

    if (!email || !password) {
        console.log("Missing fields in login request");
        return res.status(400).send("All fields are required");
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error("Error during login:", error);
            return res.status(400).send("Invalid email or password");
        }

        console.log("Login successful:", data);

        // Assuming you want to redirect to the main page
        res.redirect(`/main?email=${encodeURIComponent(email)}`);
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).send("Internal server error");
    }
});

router.get("/user-profile", async (req, res) => {
    const id = req.query.id;

    try {
        const { data, error } = await supabase
            .from('users')
            .select('username, pfp')
            .eq('id', id)
            .single();

        if (error) {
            console.error("Error fetching user profile:", error);
            return res.status(500).send("Internal server error");
        }

        res.json(data);
    } catch (err) {
        console.error("Error during fetching user profile:", err);
        res.status(500).send("Internal server error");
    }
});

// Logout endpoint
router.get("/logout", (req, res) => {
    // Logic for handling logout, such as clearing sessions or cookies
    res.redirect("/login");
});

module.exports = router;
