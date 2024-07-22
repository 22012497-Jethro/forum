const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

// Supabase setup
const supabaseUrl = "https://fudsrzbhqpmryvmxgced.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag";
const supabase = createClient(supabaseUrl, supabaseKey);

// Get comments for a post
router.post('/create', async (req, res) => {
    const { post_id, comment_text } = req.body;
    const { user_id, username } = req.session; // Adjust based on your session setup

    const { data, error } = await supabase
        .from('comments')
        .insert([{ post_id, user_id, comment_text, username }]);

    if (error) {
        return res.status(500).json({ message: 'Error creating comment' });
    }

    res.status(200).json(data[0]);
});

router.get('/:postId', async (req, res) => {
    const { postId } = req.params;

    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId);

    if (error) {
        return res.status(500).json({ message: 'Error fetching comments' });
    }

    res.status(200).json(data);
});

module.exports = router;
