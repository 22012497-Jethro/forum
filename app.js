<<<<<<< HEAD
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = process.env.PORT || 3001;

const supabaseUrl = "https://your-supabase-url.supabase.co";
const supabaseKey = "your-supabase-api-key";
const supabase = createClient(supabaseUrl, supabaseKey);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // Validate credentials against Supabase
    const { data, error } = await supabase
        .from('users') // Replace 'users' with your actual table name
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

    if (error || !data) {
        res.send("Invalid username or password");
    } else {
        res.send("Login successful!"); // You can redirect or handle the login success here
    }
});

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
=======
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = process.env.PORT || 3001;

const supabaseUrl = "https://fudsrzbhqpmryvmxgced.supabase.co/rest/v1/";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZHNyemJocXBtcnl2bXhnY2VkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM5MjE3OTQsImV4cCI6MjAyOTQ5Nzc5NH0.6UMbzoD8J1BQl01h6NSyZAHVhrWerUcD5VVGuBwRcag";

const supabase = createClient(supabaseUrl, supabaseKey);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // Validate credentials against Supabase
    const { data, error } = await supabase
        .from('users') // Replace 'users' with your actual table name
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

    if (error || !data) {
        res.send("Invalid username or password");
    } else {
        res.send("Login successful!"); // You can redirect or handle the login success here
    }
});

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
>>>>>>> 88c585683f7df74830429509e9cb830dccdd1533
