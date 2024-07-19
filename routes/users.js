const express = require("express");
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Supabase URL and API Key
const supabaseUrl = 'https://fudsrzbhqpmryvmxgced.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag';
const supabase = createClient(supabaseUrl, supabaseKey);

// Signup route
// Signup route
router.post('/signup', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        // Check if username is already taken
        const { data: usernameData, error: usernameError } = await supabase
            .from('users')
            .select('username')
            .eq('username', username);

        if (usernameError) {
            return res.status(500).json({ message: 'Error checking username' });
        }

        if (usernameData.length > 0) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        // Check if email is already taken
        const { data: emailData, error: emailError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email);

        if (emailError) {
            return res.status(500).json({ message: 'Error checking email' });
        }

        if (emailData.length > 0) {
            return res.status(400).json({ message: 'Email is already taken' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store the new user in the database
        const { data: newUser, error: newUserError } = await supabase
            .from('users')
            .insert([{ username, email, password: hashedPassword }]);

        if (newUserError) {
            return res.status(500).json({ message: 'Error creating user' });
        }

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
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
            .select('username, pfp')
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
