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
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;

    try {
        const { data, error } = await supabase
            .from('messages')
            .select('receiver_id, sender_id')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

        if (error) throw error;

        const userIds = [...new Set(data.map(msg => 
            msg.sender_id === userId ? msg.receiver_id : msg.sender_id
        ))];

        const { data: users, error: userError } = await supabase
            .from('users')
            .select('id, username')
            .in('id', userIds);

        if (userError) throw userError;
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Error fetching conversations' });
    }
});

// Route to send a message
router.post('/send', async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const sender_id = req.user.id;
    const { receiver_id, message_content } = req.body;

    if (!receiver_id || !message_content) {
        return res.status(400).json({ message: 'Receiver ID and message content are required.' });
    }

    try {
        const { data, error } = await supabase
            .from('messages')
            .insert([{
                sender_id,
                receiver_id,
                message_content,
                timestamp: new Date(),
                status: 'unread'
            }]);

        if (error) throw error;
        res.status(201).json({ message: 'Message sent', data });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Error sending message' });
    }
});

// Route to retrieve a conversation between two users
router.get('/conversation/:receiver_id', async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const sender_id = req.user.id;
    const { receiver_id } = req.params;

    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${sender_id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${sender_id})`)
            .order('timestamp', { ascending: true });

        if (error) throw error;
        res.status(200).json({ messages: data });
    } catch (error) {
        console.error('Error retrieving conversation:', error);
        res.status(500).json({ message: 'Error retrieving conversation' });
    }
});

// Route to mark messages as read
router.put('/mark-as-read/:sender_id', async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
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
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Error marking messages as read' });
    }
});

// Route to search users by username
router.get('/search', async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const username = req.query.username;
    const currentUserId = req.user.id;

    try {
        if (!username) {
            return res.status(400).json({ message: 'Username query is required' });
        }

        // Perform a search in Supabase with a case-insensitive match
        const { data: users, error } = await supabase
            .from('users')
            .select('id, username')
            .ilike('username', `%${username}%`) // Case-insensitive search
            .neq('id', currentUserId); // Exclude the current user from results

        if (error) throw error;

        res.status(200).json(users); // Return found users
    } catch (error) {
        console.error('Error searching for users:', error);
        res.status(500).json({ message: 'Error searching for users' });
    }
});

module.exports = router;
