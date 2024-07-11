const express = require("express");
const multer = require("multer");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

// Supabase setup
const supabaseUrl = "https://fudsrzbhqpmryvmxgced.supabase.co";
const supabaseKey = "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0"; // Replace with your actual key
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
    let imageUrl = null;

    if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
    }

    try {
        const { data, error } = await supabase
            .from('posts')
            .insert([{ title, caption, image: imageUrl, category, theme, rooms, room_category, user_id: req.session.userId }]);

        if (error) {
            console.error("Error creating post:", error);
            return res.status(500).send("Error creating post");
        }

        res.redirect("/main");
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).send("Internal server error");
    }
});

// Fetch posts endpoint
router.get('/posts', async (req, res) => {
    const { data, error } = await supabase
        .from('posts')
        .select('*');

    if (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).send('Error fetching posts');
    }

    res.json(data);
});

module.exports = router;
