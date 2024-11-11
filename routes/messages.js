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
        // Fetch all messages involving the current user
        const { data, error } = await supabase
            .from('messages')
            .select('receiver_id, sender_id')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

        if (error) throw error;

        // Extract unique user IDs involved in conversations with the current user
        const userIds = [...new Set(data.map(msg => 
            msg.sender_id === userId ? msg.receiver_id : msg.sender_id
        ))];

        // Fetch user details for each unique user ID
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
    const { receiver_id, message_content } = req.body;
    const sender_id = req.user.id;

    if (!receiver_id || !message_content) {
        return res.status(400).json({ message: 'Receiver ID and message content are required.' });
    }

    try {
        // Insert a new message into the database
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

// Route to retrieve conversation between two users with optional pagination
router.get('/conversation/:receiver_id', async (req, res) => {
    const sender_id = req.user.id;
    const { receiver_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    try {
        // Fetch messages between the current user and the specified receiver
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${sender_id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${sender_id})`)
            .order('timestamp', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        // Count total messages for pagination info
        const { count, error: countError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .or(`and(sender_id.eq.${sender_id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${sender_id})`);

        if (countError) throw countError;

        res.status(200).json({ messages: data, totalMessages: count });
    } catch (error) {
        console.error('Error retrieving conversation:', error);
        res.status(500).json({ message: 'Error retrieving conversation' });
    }
});

// Route to mark messages as read
router.put('/mark-as-read/:sender_id', async (req, res) => {
    const receiver_id = req.user.id;
    const { sender_id } = req.params;

    try {
        // Update message status to 'read' for messages from the specified sender to the current user
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
    const username = req.query.username; // Search query
    const page = parseInt(req.query.page) || 1; // Current page
    const limit = parseInt(req.query.limit) || 5; // Results per page
    const offset = (page - 1) * limit; // Calculate offset for pagination

    try {
        if (!username) {
            return res.status(400).json({ message: 'Username query is required' });
        }

        // Search for users by username and exclude the current user if needed
        const { data: users, error } = await supabase
            .from('users')
            .select('id, username')
            .ilike('username', `%${username}%`)
            .range(offset, offset + limit - 1); // Apply pagination using range

        if (error) throw error;

        // Count total matching users for pagination
        const { count, error: countError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .ilike('username', `%${username}%`);

        if (countError) throw countError;

        res.status(200).json({ users, totalUsers: count });
    } catch (error) {
        console.error('Error in /messages/search route:', error);
        res.status(500).json({ message: 'Error searching for users' });
    }
});

module.exports = router;
