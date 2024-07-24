const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Supabase setup
const supabaseUrl = "https://fudsrzbhqpmryvmxgced.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag";
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to verify user authentication
const authenticateUser = require('../middleware/authenticateUser');

// Route to add a comment
router.post('/addComment', authenticateUser, async (req, res) => {
    const { user_id, post_id, comment } = req.body;
    const { data, error } = await supabase
        .from('comments')
        .insert([{ user_id, post_id, comment, created_at: new Date() }]);

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(201).json(data);
});

// Route to get comments for a specific post
router.get('/', async (req, res) => {
    const { post_id } = req.query;
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', post_id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(200).json(data);
});

module.exports = router;
