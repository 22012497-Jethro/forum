const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const authenticateUser = require('../middleware/authMiddleware');

// Supabase setup
const supabaseUrl = "https://fudsrzbhqpmryvmxgced.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag";
const supabase = createClient(supabaseUrl, supabaseKey);

// Route to get conversations
router.get('/conversations', async (req, res) => {
    const userId = req.session.userId;

    try {
        const { data, error } = await supabase
            .from('messages')
            .select('receiver_id, sender_id')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

        if (error) throw error;

        // Extract unique user IDs involved in conversations
        const userIds = [...new Set(data.map(msg => 
            msg.sender_id === userId ? msg.receiver_id : msg.sender_id
        ))];

        // Fetch user details including profile picture
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('id, username, pfp')
            .in('id', userIds);

        if (userError) throw userError;

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching conversations' });
    }
});

// Route to send a message
router.post('/send', async (req, res) => {
    const { receiver_id, content } = req.body;
    const sender_id = req.session.userId;

    if (!receiver_id || !content) {
        return res.status(400).json({ message: 'Receiver ID and message content are required.' });
    }

    try {
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                sender_id,
                receiver_id,
                content,
                status: false, // Unread status
                created_at: new Date() // Timestamp
            }])
            .select();

        if (error) throw error;

        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error sending message' });
    }
});

// Route to mark messages as read
router.put('/mark-as-read/:sender_id', async (req, res) => {
    const receiver_id = req.session.userId;
    const { sender_id } = req.params;

    try {
        const { data, error } = await supabase
            .from('messages')
            .update({ status: true }) // Mark as read
            .match({ sender_id, receiver_id, status: false }); // Match only unread messages

        if (error) throw error;

        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking messages as read' });
    }
});

// Route to search users by username and include profile picture
router.get('/search', async (req, res) => {
    const username = req.query.username;
    const currentUserId = req.session.userId;

    try {
        if (!username) {
            return res.status(400).json({ message: 'Username query is required' });
        }

        const { data: users, error } = await supabase
            .from('users')
            .select('id, username, pfp')
            .ilike('username', `%${username}%`)
            .neq('id', currentUserId); // Exclude the current user

        if (error) throw error;

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error searching for users' });
    }
});

module.exports = router;
