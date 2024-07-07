const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = process.env.PORT || 3001;

// Supabase setup
const supabaseUrl = "https://fudsrzbhqpmryvmxgced.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag";
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files for the frontend
app.get("/", (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, 'public/signup.html')));
app.get("/main", (req, res) => res.sendFile(path.join(__dirname, 'public/main.html')));

// Login endpoint
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (authError) {
        console.error("Auth Error:", authError);
        return res.send("Invalid email or password");
    }

    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (userError) {
        console.error("User Error:", userError);
        return res.send("User not found");
    }

    res.redirect(`/main?username=${userData.username}&pfp=${encodeURIComponent(userData.pfp)}`);
});

// Logout endpoint
app.get("/logout", async (req, res) => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Logout Error:", error);
        return res.send("Logout failed");
    }

    res.redirect("/login");
});

// Create post endpoint
app.post('/create-post', upload.single('image'), async (req, res) => {
    const { title, caption, category, theme, rooms, room_category } = req.body;

    if (!title || !caption) {
        return res.status(400).send('Title and caption are required');
    }

    let imageUrl = '';

    if (req.file) {
        const { data, error } = await supabase
            .storage
            .from('public')
            .upload(`posts/${req.file.originalname}`, req.file.buffer, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Error uploading file:', error);
            return res.status(500).send('Error uploading file');
        }

        imageUrl = data.Key;
    }

    const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert([
            { title, caption, image: imageUrl, category, theme, rooms, room_category }
        ]);

    if (postError) {
        console.error('Error creating post:', postError);
        return res.status(500).send('Error creating post');
    }

    res.json(postData[0]);
});

// Fetch posts endpoint
app.get('/posts', async (req, res) => {
    const { data: posts, error } = await supabase
        .from('posts')
        .select('*');

    if (error) {
        console.error('Error fetching posts:', error);
        return res.status(500).send('Error fetching posts');
    }

    res.json(posts);
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
