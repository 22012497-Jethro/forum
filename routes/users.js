const express = require("express");
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Supabase URL and API Key
const supabaseUrl = 'https://fudsrzbhqpmryvmxgced.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag';
const supabase = createClient(supabaseUrl, supabaseKey);

// Default values
const defaultProfilePicture = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
const defaultRole = 'User';

// Configure multer for profile picture uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware to check if the user is authenticated
const authenticateUser = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};

// Signup route
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Create user using Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            console.error('Error creating user with Supabase Auth:', error.message);
            return res.status(500).json({ message: `Error creating user with Supabase Auth: ${error.message}` });
        }

        console.log('Response from Supabase Auth:', data);

        if (!data.user) {
            return res.status(500).json({ message: 'User creation with Supabase Auth failed.' });
        }

        const user = data.user;

        // Store additional user data in the 'users' table
        const { data: newUser, error: newUserError } = await supabase
            .from('users')
            .insert([{
                id: user.id, // Store the Supabase Auth user ID
                username,
                email,
                pfp: defaultProfilePicture,
                roles: defaultRole,
                created_at: new Date().toISOString()
            }]);

        if (newUserError) {
            console.error('Error creating user in users table:', newUserError.message);
            return res.status(500).json({ message: `Error creating user in users table: ${newUserError.message}` });
        }

        console.log('User saved in users table:', newUser);

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Internal server error:', error.message);
        res.status(500).json({ message: `Internal server error: ${error.message}` });
    }
});

// Login endpoint
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    console.log("Login request received:", { email, password });

    if (!email || !password) {
        console.log("Missing fields in login request");
        return res.status(400).send("All fields are required");
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error("Error during login:", error);
            return res.status(400).send("Invalid email or password");
        }

        console.log("Login successful:", data);

        // Store user ID in session
        req.session.userId = data.user.id;
        console.log("User ID stored in session:", req.session.userId);

        res.redirect(`/main?email=${encodeURIComponent(email)}`);
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).send("Internal server error: " + err.message);
    }
});

// Fetch user profile data
router.get("/user-profile", async (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(401).send("Unauthorized");
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('username, email, pfp')
            .eq('id', userId)
            .single();

        if (error) {
            console.error("Error fetching user profile:", error);
            return res.status(500).send("Internal server error");
        }

        res.json(data);
    } catch (err) {
        console.error("Error during fetching user profile:", err);
        res.status(500).send("Internal server error");
    }
});

// Update user profile route
router.post('/update-profile', upload.single('pfp'), async (req, res) => {
    const { username, email } = req.body;
    const userId = req.session.userId;
    let updatedFields = {};

    if (username) {
        const { data: usernameData, error: usernameError } = await supabase
            .from('users')
            .select('username')
            .eq('username', username);

        if (usernameError) {
            return res.status(500).json({ message: 'Error checking username' });
        }

        if (usernameData.length > 0 && usernameData[0].id !== userId) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        updatedFields.username = username;
    }

    if (email) {
        const { data: emailData, error: emailError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email);

        if (emailError) {
            return res.status(500).json({ message: 'Error checking email' });
        }

        if (emailData.length > 0 && emailData[0].id !== userId) {
            return res.status(400).json({ message: 'Email is already taken' });
        }

        updatedFields.email = email;
    }

    if (req.file) {
        try {
            const uploadPath = `pfp/${Date.now()}-${req.file.originalname}`;
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('user profile')
                .upload(uploadPath, req.file.buffer, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) {
                return res.status(500).json({ message: 'Error uploading profile picture' });
            }

            const { publicUrl } = supabase
                .storage
                .from('user profile')
                .getPublicUrl(uploadPath);

            if (publicUrl.error) {
                return res.status(500).json({ message: 'Error generating profile picture URL' });
            }

            updatedFields.pfp = publicUrl.publicUrl;
        } catch (error) {
            return res.status(500).json({ message: 'Error uploading profile picture' });
        }
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

router.get("/post-profile", async (req, res) => {
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
            console.error("Error fetching user profile:", error);
            return res.status(500).send("Internal server error");
        }

        res.json(data);
    } catch (err) {
        console.error("Error during fetching user profile:", err);
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
        console.error('Error fetching user posts:', error);
        res.status(500).send('Error fetching user posts');
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.sendStatus(200);
    });
});

module.exports = router;
