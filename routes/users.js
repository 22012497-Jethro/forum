const express = require("express");
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Supabase URL and API Key
const supabaseUrl = 'https://fudsrzbhqpmryvmxgced.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag';
const supabase = createClient(supabaseUrl, supabaseKey);

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

        // Store user ID in session
        req.session.userId = data.user.id;
        console.log("User ID stored in session:", req.session.userId);

        res.redirect(`/main?email=${encodeURIComponent(email)}`);
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).send("Internal server error: " + err.message);
    }
});

module.exports = router;
