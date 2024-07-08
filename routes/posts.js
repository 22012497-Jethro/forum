const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Supabase setup
const supabaseUrl = "https://fudsrzbhqpmryvmxgced.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag";
const supabase = createClient(supabaseUrl, supabaseKey);

// Create post endpoint
router.post('/create-post', upload.single('image'), async (req, res) => {
    const { title, caption, category, theme, rooms, room_category } = req.body;
    let imageUrl = '';

    if (!title || !caption) {
        return res.status(400).send('Title and caption are required');
    }

    if (req.file) {
        // Save the image to a directory (you need to create the 'uploads' directory)
        const imagePath = path.join(__dirname, '../uploads', req.file.originalname);
        fs.writeFileSync(imagePath, req.file.buffer);
        imageUrl = imagePath;
    }

    const parsedRooms = rooms ? parseInt(rooms) : null;

    const { data, error } = await supabase
        .from('posts')
        .insert([{ title, caption, image: imageUrl, category, theme, rooms: parsedRooms, room_category }]);

    if (error) {
        console.error('Error creating post:', error);
        return res.status(500).send('Error creating post');
    }

    res.json(data);
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
