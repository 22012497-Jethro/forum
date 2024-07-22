const express = require('express');
const router = express.Router();
const { supabase } = require('../supabaseClient');

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
