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
        const { data: conversations, error } = await supabase
            .from('messages')
            .select('receiver_id, sender_id, content, created_at')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Extract unique user IDs and their latest message for conversations
        const userConversations = {};
        conversations.forEach((message) => {
            const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id;
            if (!userConversations[otherUserId]) {
                userConversations[otherUserId] = {
                    id: otherUserId,
                    last_message: message.content,
                    last_message_time: message.created_at,
                };
            }
        });

        // Fetch user details for each unique user ID in the conversations
        const userIds = Object.keys(userConversations);
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('id, username, pfp')
            .in('id', userIds);

        if (userError) throw userError;

        // Attach username and profile picture to each conversation
        users.forEach(user => {
            if (userConversations[user.id]) {
                userConversations[user.id].username = user.username;
                userConversations[user.id].pfp = user.pfp || 'default-profile.png';
            }
        });

        // Send the conversation data as an array
        res.status(200).json(Object.values(userConversations));
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
            .insert([{ sender_id, receiver_id, content, status: false, created_at: new Date() }])
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
            .update({ status: true })
            .match({ sender_id, receiver_id, status: false });

        if (error) throw error;

        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking messages as read' });
    }
});

// Route to search users by username
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
            .neq('id', currentUserId);

        if (error) throw error;

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error searching for users' });
    }
});

// Route to retrieve all messages in a conversation with timestamps
router.get('/conversation/:receiver_id', async (req, res) => {
    const sender_id = req.session.userId;
    const { receiver_id } = req.params;

    try {
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${sender_id},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${sender_id})`)
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.status(200).json({ messages });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving conversation' });
    }
});

module.exports = router;
