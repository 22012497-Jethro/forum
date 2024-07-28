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

const authenticateUser = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};

// Apply authentication middleware to the routes
router.use(authenticateUser);

// Create post endpoint
router.post("/create", upload.single('image'), async (req, res) => {
    const { title, caption, category, theme, rooms, room_category } = req.body;
    const userId = req.session.userId;
    let imageUrl = null;

    if (req.file) {
        console.log("Received file:", req.file);
        try {
            const uploadResponse = await supabase
                .storage
                .from('post-images')
                .upload(`${Date.now()}-${req.file.originalname}`, req.file.buffer, {
                    cacheControl: '3600',
                    upsert: false,
                });

            console.log("Upload response:", uploadResponse);

            if (uploadResponse.error) {
                console.error("Error uploading to Supabase storage:", uploadResponse.error.message);
                return res.status(500).send("Error uploading image: " + uploadResponse.error.message);
            }

            const uploadedPath = uploadResponse.data.path;

            console.log("Uploaded Path:", uploadedPath);

            const publicUrlResponse = supabase
                .storage
                .from('post-images')
                .getPublicUrl(uploadedPath);

            console.log("Public URL response:", publicUrlResponse);

            if (publicUrlResponse.error) {
                console.error("Error generating public URL:", publicUrlResponse.error.message);
                return res.status(500).send("Error generating public URL: " + publicUrlResponse.error.message);
            }

            imageUrl = publicUrlResponse.data.publicUrl;
            console.log("Generated image URL:", imageUrl);
        } catch (error) {
            console.error("Supabase storage error:", error.message);
            return res.status(500).send("Error uploading image: " + error.message);
        }
    } else {
        console.log("No file uploaded");
    }

    try {
        const createdAt = new Date().toISOString();
        console.log("Creating post with data:", { title, caption, image: imageUrl, category, theme, rooms, room_category, user_id: userId, created_at: createdAt });

        const { data, error } = await supabase
            .from('posts')
            .insert([{ title, caption, image: imageUrl, category, theme, rooms, room_category, user_id: userId, created_at: createdAt }]);

        if (error) {
            console.error("Error inserting post into database:", error.message);
            return res.status(500).send("Error creating post: " + error.message);
        }

        console.log("Post created successfully:", data);
        res.redirect("/main");
    } catch (err) {
        console.error("Error creating post:", err.message);
        res.status(500).send("Internal server error: " + err.message);
    }
});

// Delete post endpoint
router.delete('/:postId', authenticateUser, async (req, res) => {
    const { postId } = req.params;
    const { image_url } = req.body;

    try {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) {
            return res.status(500).send('Error deleting post');
        }

        if (image_url) {
            const imagePath = image_url.split('/').pop();
            const { error: storageError } = await supabase
                .storage
                .from('post-images')
                .remove([imagePath]);

            if (storageError) {
                return res.status(500).send('Error deleting image');
            }
        }

        res.sendStatus(204);
    } catch (error) {
        res.status(500).send('Error deleting post');
    }
});

// Update a post
router.put('/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { title, caption, category, theme, number_of_rooms, room_category } = req.body;
    const imageFile = req.file;

    let imageUrl = req.body.current_image_url; // default to the current image URL

    if (imageFile) {
        // Upload the new image to Supabase Storage
        const { data, error } = await supabase.storage
            .from('post-images')
            .upload(`public/${imageFile.filename}`, imageFile.path);

        if (error) {
            console.error('Error uploading image:', error);
            return res.status(500).json({ message: 'Error uploading image' });
        }

        imageUrl = data.Key;
    }

    const updates = {
        title,
        caption,
        category,
        theme,
        number_of_rooms,
        room_category,
        image: imageUrl
    };

    // Remove undefined fields from the updates object
    Object.keys(updates).forEach(key => {
        if (updates[key] === undefined) {
            delete updates[key];
        }
    });

    const { error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('Error updating post:', error);
        return res.status(500).json({ message: 'Error updating post' });
    }

    res.json({ message: 'Post updated successfully' });
});

// Get all posts with pagination
router.put('/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { title, caption, category, theme, number_of_rooms, room_category } = req.body;
    const imageFile = req.file;

    let imageUrl = req.body.current_image_url; // default to the current image URL

    if (imageFile) {
        // Upload the new image to Supabase Storage
        const { data, error } = await supabase.storage
            .from('post-images')
            .upload(`public/${imageFile.filename}`, imageFile.path);

        if (error) {
            console.error('Error uploading image:', error);
            return res.status(500).json({ message: 'Error uploading image' });
        }

        imageUrl = data.Key;
    }

    const updates = {
        title,
        caption,
        category,
        theme,
        number_of_rooms,
        room_category,
        image: imageUrl
    };

    // Remove undefined fields from the updates object
    Object.keys(updates).forEach(key => {
        if (updates[key] === undefined) {
            delete updates[key];
        }
    });

    const { error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('Error updating post:', error);
        return res.status(500).json({ message: 'Error updating post' });
    }

    res.json({ message: 'Post updated successfully' });
});

// Fetch posts endpoint
router.get('/', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    try {
        const { data: posts, error } = await supabase
            .from('posts')
            .select('id, title, caption, user_id, created_at, category, theme, rooms, room_category, image')
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) {
            return res.status(500).send('Error fetching posts');
        }

        const userIds = posts.map(post => post.user_id);
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('id, username, pfp')
            .in('id', userIds);

        if (userError) {
            return res.status(500).send('Error fetching users');
        }

        const postsWithUsernames = posts.map(post => {
            const user = users.find(user => user.id === post.user_id);
            return { 
                ...post, 
                username: user ? user.username : 'Unknown', 
                profile_pic: user ? user.pfp : 'default-profile.png' 
            };
        });

        console.log(postsWithUsernames); // Log the fetched data for debugging

        res.json(postsWithUsernames);
    } catch (error) {
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

// Get a single post by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`Fetching post with ID: ${id}`);

    // Fetch the post data
    const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching post: ${error.message}`);
        return res.status(500).json({ message: 'Error fetching post data!' });
    }

    if (!post) {
        console.error('Post not found');
        return res.status(404).json({ message: 'Post not found!' });
    }

    // Fetch the user data based on user_id in the post
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('username, pfp')
        .eq('id', post.user_id)
        .single();

    if (userError) {
        console.error(`Error fetching user: ${userError.message}`);
        return res.status(500).json({ message: 'Error fetching user data!' });
    }

    // Add user data to the post object
    post.user = user;

    console.log(`Post fetched successfully: ${JSON.stringify(post)}`);
    res.json(post);
});

router.get('/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    try {
        const { data: comments, error } = await supabase
            .from('comments')
            .select('id, text, created_at, user_id')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // Fetch user details for each comment
        const userIds = comments.map(comment => comment.user_id);
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('id, username')
            .in('id', userIds);

        if (userError) {
            return res.status(500).json({ error: userError.message });
        }

        const commentsWithUsernames = comments.map(comment => {
            const user = users.find(user => user.id === comment.user_id);
            return { 
                ...comment, 
                username: user ? user.username : 'Unknown' 
            };
        });

        res.json(commentsWithUsernames);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Post a comment
router.post('/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.session.userId; // Make sure user is authenticated

    try {
        const { data, error } = await supabase
            .from('comments')
            .insert([{ text, post_id: postId, user_id: userId }]);

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;