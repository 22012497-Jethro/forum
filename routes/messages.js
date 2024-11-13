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
        // Fetch messages for the user, ordered by created_at descending (latest first)
        const { data: messages, error } = await supabase
            .from('messages')
            .select('sender_id, receiver_id, content, created_at')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Extract unique conversation partners with their latest message
        const conversationsMap = new Map();
        messages.forEach((message) => {
            const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
            if (!conversationsMap.has(otherUserId)) {
                conversationsMap.set(otherUserId, message); // Store the latest message for each conversation
            }
        });

        // Fetch user details for each conversation partner
        const userIds = Array.from(conversationsMap.keys());
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('id, username, pfp')
            .in('id', userIds);

        if (userError) throw userError;

        // Combine user details with the latest message for each conversation
        const conversations = users.map((user) => {
            const message = conversationsMap.get(user.id);
            return {
                userId: user.id,
                username: user.username,
                pfp: user.pfp || 'default-profile.png',
                lastMessage: message.content,
                timestamp: message.created_at,
            };
        });

        res.status(200).json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
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
        console.error('Error sending message:', error);
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

// Route to retrieve all messages in a conversation between the current user and the receiver
router.get('/conversation/:receiver_id', async (req, res) => {
    const sender_id = req.session.userId; // Current user
    const { receiver_id } = req.params; // Selected receiver

    try {
        // Fetch all messages between sender and receiver
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${sender_id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${sender_id})`)
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.status(200).json({ messages }); // Send all messages to the frontend
    } catch (error) {
        console.error('Error retrieving conversation:', error);
        res.status(500).json({ message: 'Error retrieving conversation' });
    }
});

module.exports = router;
