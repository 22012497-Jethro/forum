const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3001;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));

const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
