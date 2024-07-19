const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Supabase setup
const supabaseUrl = "https://fudsrzbhqpmryvmxgced.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag";
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to check if the user is authenticated
const authenticateUser = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};

// Apply authentication middleware to the routes
router.use(authenticateUser);

// Create a comment
router.post('/create', async (req, res) => {
    const { post_id, comment_text } = req.body;
    const user_id = req.session.userId;

    try {
        const { data, error } = await supabase
            .from('comments')
            .insert([{ post_id, user_id, comment_text }]);

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        res.status(500).send('Error creating comment');
    }
});

// Fetch comments for a post
router.get('/:post_id', async (req, res) => {
    const { post_id } = req.params;

    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*, users(username)')
            .eq('post_id', post_id)
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        res.status(500).send('Error fetching comments');
    }
});

module.exports = router;