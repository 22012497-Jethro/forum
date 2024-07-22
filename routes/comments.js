const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://fudsrzbhqpmryvmxgced.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_KEY'; // Replace with your actual Supabase key
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to ensure user is authenticated
const authenticateUser = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};

// Apply authentication middleware to the routes
router.use(authenticateUser);

// Endpoint to fetch comments for a specific post
router.get('/:postId', async (req, res) => {
    const { postId } = req.params;

    try {
        const { data: comments, error } = await supabase
            .from('comments')
            .select('*, users(username)')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error.message);
        res.status(500).send('Error fetching comments');
    }
});

// Endpoint to create a new comment
router.post('/create', async (req, res) => {
    const { post_id, comment_text } = req.body;
    const user_id = req.session.userId;

    try {
        const { data: comment, error } = await supabase
            .from('comments')
            .insert([{ post_id, comment_text, user_id, created_at: new Date().toISOString() }]);

        if (error) throw error;

        res.json(comment);
    } catch (error) {
        console.error('Error creating comment:', error.message);
        res.status(500).send('Error creating comment');
    }
});

module.exports = router;
