const express = require("express");
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const saltRounds = 10; // Number of salt rounds for bcrypt

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
        // Fetch user by email
        const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (fetchError) {
            console.error("Error fetching user:", fetchError);
            return res.status(400).send("Invalid email or password");
        }

        console.log("User fetched successfully:", userData);

        // Check password
        const isPasswordValid = await bcrypt.compare(password, userData.password);
        if (!isPasswordValid) {
            console.log("Invalid password");
            return res.status(400).send("Invalid email or password");
        }

        // Store user ID in session
        req.session.userId = userData.id;
        console.log("User ID stored in session:", req.session.userId);

        res.redirect(`/main?email=${encodeURIComponent(email)}`);
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).send("Internal server error: " + err.message);
    }
});

module.exports = router;
