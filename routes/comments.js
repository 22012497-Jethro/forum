const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_KEY');

// Middleware to verify user authentication
const authenticateUser = require('../middleware/authenticateUser');

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

module.exports = router;
