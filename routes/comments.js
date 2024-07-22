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
router.get('/:postId', async (req, res) => {
    const { postId } = req.params;

    const { data: comments, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching comments:', error);
        return res.status(500).json({ message: 'Error fetching comments' });
    }

    res.json(comments);
});

// Add a new comment
router.post('/', async (req, res) => {
    const { post_id, user_id, comment_text } = req.body;

    const { data, error } = await supabase
        .from('comments')
        .insert([
            { post_id, user_id, comment_text }
        ]);

    if (error) {
        console.error('Error adding comment:', error);
        return res.status(500).json({ message: 'Error adding comment' });
    }

    res.json({ message: 'Comment added successfully' });
});

module.exports = router;
