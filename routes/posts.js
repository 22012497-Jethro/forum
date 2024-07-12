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
const storage = multer.memoryStorage();
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
        const {data, error} = await supabase
            .storage
            .from('post-images')
            .upload(`public/${Date.now()}-${req.file.originalname}`, req.file.buffer, {cacheControl:'3600', upsert: false});
        
        if (error) {
            console.error("Supabase storage error:", error);
            return res.status(500).send("Error uploading image");
        }

        imageUrl = supabase
            .storage
            .from('post-images')
            .getPublicUrl(data.path).publicURL;
    }

    try {
        const createdAt = new Date().toISOString();  // Get current timestamp
        console.log("Creating post with data:", { title, caption, image: imageUrl, category, theme, rooms, room_category, userId, createdAt });

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
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);

        if (error) {
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).send('Error fetching posts');
    }
});

router.get("/user-profile", async (req, res) => {
    const userId = req.query.id;

    try {
        const { data, error } = await supabase
            .from("users")
            .select("username, pfp")
            .eq("id", userId)
            .single();

        if (error) {
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).send("Error fetching user profile");
    }
});

router.get('/latest-posts', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);

        if (error) {
            console.error('Error fetching latest posts:', error);
            return res.status(500).send('Error fetching latest posts');
        }

        console.log('Fetched latest posts:', data); // Debugging line

        res.json(data);
    } catch (err) {
        console.error('Error during fetching latest posts:', err);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
