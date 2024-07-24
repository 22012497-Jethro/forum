const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Supabase setup
const supabaseUrl = "https://fudsrzbhqpmryvmxgced.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag";
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to verify user authentication
const authenticateUser = require('../middleware/authenticateUser');

// Add a comment
router.post('/addComment', async (req, res) => {
    const { user_id, post_id, comment } = req.body;

    try {
        const { data, error } = await supabase
            .from('comments')
            .insert([{ user_id, post_id, comment, created_at: new Date().toISOString() }]);

        if (error) {
            console.error('Error adding comment:', error);
            return res.status(500).json({ message: 'Error adding comment' });
        }

        res.status(201).json(data);
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get comments for a post
router.get('/', async (req, res) => {
    const { post_id } = req.query;

    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', post_id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching comments:', error);
            return res.status(500).json({ message: 'Error fetching comments' });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Internal server error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
