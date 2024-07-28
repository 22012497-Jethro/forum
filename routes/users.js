const express = require("express");
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const authenticateUser = require('../middleware/authMiddleware'); // Ensure correct path

const router = express.Router();

// Supabase URL and API Key
const supabaseUrl = 'https://fudsrzbhqpmryvmxgced.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Default values
const defaultProfilePicture = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
const defaultRole = 'User';

// Configure multer for profile picture uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Signup route
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            return res.status(500).json({ message: `Error creating user with Supabase Auth: ${error.message}` });
        }

        if (!data.user) {
            return res.status(500).json({ message: 'User creation with Supabase Auth failed.' });
        }

        const user = data.user;

        const { data: newUser, error: newUserError } = await supabase
            .from('users')
            .insert([
                { id: user.id, username: username, email: email, role: defaultRole, pfp: defaultProfilePicture }
            ]);

        if (newUserError) {
            return res.status(500).json({ message: `Error storing additional user data: ${newUserError.message}` });
        }

        req.session.userId = user.id;

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (data.user) {
        req.session.userId = data.user.id;
        res.redirect('/main');
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
});

// Profile update route
router.put('/profile', authenticateUser, upload.single('profilePicture'), async (req, res) => {
    const userId = req.session.userId;
    const { username, email } = req.body;
    const profilePicture = req.file;

    const updatedFields = { username, email };

    if (profilePicture) {
        const { data, error } = await supabase
            .storage
            .from('profile-pictures')
            .upload(`${Date.now()}-${profilePicture.originalname}`, profilePicture.buffer, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            return res.status(500).json({ message: 'Error uploading profile picture' });
        }

        const uploadedPath = data.path;
        const { publicUrl } = supabase.storage.from('profile-pictures').getPublicUrl(uploadedPath);

        updatedFields.pfp = publicUrl;
    }

    const { data, error } = await supabase
        .from('users')
        .update(updatedFields)
        .eq('id', userId);

    if (error) {
        return res.status(500).json({ message: 'Error updating profile' });
    }

    res.status(200).json({ message: 'Profile updated successfully' });
});

router.get("/post-profile", authenticateUser, async (req, res) => {
    const userPostId = req.query.id;

    if (!userPostId) {
        return res.status(401).send("Unauthorized");
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('username, pfp')
            .eq('id', userPostId)
            .single();

        if (error) {
            return res.status(500).send("Internal server error");
        }

        res.json(data);
    } catch (err) {
        res.status(500).send("Internal server error");
    }
});

router.get('/user-posts', authenticateUser, async (req, res) => {
    const userId = req.session.userId;
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        res.json(data);
    } catch (error) {
        res.status(500).send('Error fetching user posts');
    }
});

router.post('/logout', authenticateUser, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.clearCookie('connect.sid');
        res.sendStatus(200);
    });
});

module.exports = router;
