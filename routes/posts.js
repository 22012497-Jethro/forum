const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

// Supabase setup
const supabaseUrl = "https://fudsrzbhqpmryvmxgced.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag";
const supabase = createClient(supabaseUrl, supabaseKey);

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Create post endpoint
router.post("/create", upload.single('image'), async (req, res) => {
    const { title, caption, category, theme, rooms, room_category } = req.body;
    const userId = req.session.userId;  // Retrieve user ID from session
    let imageUrl = null;

    if (!userId) {
        console.error("Unauthorized attempt to create post");
        return res.status(401).send("Unauthorized");
    }

    if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
    }

    try {
        const createdAt = new Date().toISOString();  // Get current timestamp
        console.log("Creating post with data:", { title, caption, image: imageUrl, category, theme, rooms, room_category, userId });

        const { data, error } = await supabase
            .from('posts')
            .insert([{ title, caption, image: imageUrl, category, theme, rooms, room_category, user_id: userId, created_at: createdAt }]);
        
        if (error) {
            console.error("Supabase error details:", error);
            return res.status(500).send("Error creating post: " + error.message);
        }

        console.log("Post created successfully:", data);
        res.redirect("/main");
    } catch (err) {
        console.error("Error creating post:", err.message);
        res.status(500).send("Internal server error: " + err.message);
    }
});

// Fetch posts endpoint
router.get('/posts', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*');

        if (error) {
            console.error('Error fetching posts:', error);
            return res.status(500).send('Error fetching posts: ' + error.message);
        }

        res.json(data);
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).send('Internal server error: ' + err.message);
    }
});

module.exports = router;
