const express = require("express");
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const saltRounds = 10; // Number of salt rounds for bcrypt

// Supabase URL and API Key
const supabaseUrl = 'https://fudsrzbhqpmryvmxgced.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag';
const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch user data endpoint
router.get("/user-data", async (req, res) => {
    const userId = req.session.userId; // Ensure userId is stored in the session
    if (!userId) {
        return res.status(401).send("Unauthorized");
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('username, pfp') // Select relevant user data
            .eq('id', userId)
            .single();

        if (error) {
            console.error("Error fetching user data:", error);
            return res.status(500).send("Error fetching user data");
        }

        res.json(data);
    } catch (err) {
        console.error("Error fetching user data:", err);
        res.status(500).send("Internal server error");
    }
});

module.exports = router;
