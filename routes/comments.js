const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Supabase setup
const supabaseUrl = "https://fudsrzbhqpmryvmxgced.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag";
const supabase = createClient(supabaseUrl, supabaseKey);

// Get comments by post ID
router.get('/', async (req, res) => {
    const postId = parseInt(req.query.post_id, 10);
    const { data: comments, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId);

    if (error) {
        return res.status(500).json({ error: 'Failed to fetch comments' });
    }
    res.json(comments);
});

// Add a new comment
router.post('/addComment', async (req, res) => {
    const { user_id, post_id, comment } = req.body;
    const { data: newComment, error } = await supabase
        .from('comments')
        .insert([{ user_id, post_id, comment }])
        .single();

    if (error) {
        return res.status(500).json({ error: 'Failed to add comment' });
    }
    res.json([newComment]);
});

module.exports = router;
