const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = process.env.PORT || 3001;

const supabaseUrl = "https://fudsrzbhqpmryvmxgced.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag";
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));
app.get("/signup", (req, res) => res.sendFile(path.join(__dirname, 'public/signup.html')));

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (authError) {
        return res.send("Invalid email or password");
    }

    const { data: userData, error: userError } = await supabase
        .from('users') // Replace 'users' with your actual table name
        .select('*')
        .eq('email', email)
        .single();

    if (userError) {
        return res.send("User not found");
    }

    res.redirect(`/main?username=${userData.username}&pfp=${encodeURIComponent(userData.pfp)}`);
});

app.get("/main", (req, res) => {
    res.sendFile(path.join(__dirname, 'public/main.html'));
});

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
