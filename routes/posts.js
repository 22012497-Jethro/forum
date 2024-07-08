const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require('../database'); // Import the SQLite database

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create post endpoint
router.post('/create-post', upload.single('image'), (req, res) => {
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

    const stmt = db.prepare("INSERT INTO posts (title, caption, image, category, theme, rooms, room_category) VALUES (?, ?, ?, ?, ?, ?, ?)");
    stmt.run(title, caption, imageUrl, category, theme, rooms, room_category, function (err) {
        if (err) {
            console.error('Error creating post:', err);
            return res.status(500).send('Error creating post');
        }

        res.json({ id: this.lastID, title, caption, image: imageUrl, category, theme, rooms, room_category });
    });
    stmt.finalize();
});

// Fetch posts endpoint
router.get('/posts', (req, res) => {
    db.all("SELECT * FROM posts", (err, rows) => {
        if (err) {
            console.error('Error fetching posts:', err);
            return res.status(500).send('Error fetching posts');
        }

        res.json(rows);
    });
});

module.exports = router;
