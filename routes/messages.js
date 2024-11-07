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
    const userId = req.user.id;

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

        // Fetch user details based on unique user IDs
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('id, username')
            .in('id', userIds);

        if (userError) throw userError;
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching conversations' });
    }
});

// Route to send a message
router.post('/send', async (req, res) => {
    const { receiver_id, message_content } = req.body;
    const sender_id = req.user.id;

    try {
        const { data, error } = await supabase
            .from('messages')
            .insert([
                {
                    sender_id,
                    receiver_id,
                    message_content,
                    timestamp: new Date(),
                    status: 'unread'
                }
            ]);

        if (error) throw error;
        res.status(201).json({ message: 'Message sent', data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending message' });
    }
});

// Route to retrieve conversation between two users
router.get('/conversation/:receiver_id', async (req, res) => {
    const sender_id = req.user.id;
    const { receiver_id } = req.params;

    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${sender_id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${sender_id})`)
            .order('timestamp', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving conversation' });
    }
});

// Route to mark messages as read
router.put('/mark-as-read/:sender_id', async (req, res) => {
    const receiver_id = req.user.id;
    const { sender_id } = req.params;

    try {
        const { data, error } = await supabase
            .from('messages')
            .update({ status: 'read' })
            .match({ sender_id, receiver_id, status: 'unread' });

        if (error) throw error;
        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error marking messages as read' });
    }
});

module.exports = router;
