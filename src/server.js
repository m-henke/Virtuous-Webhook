const express = require('express');
const path = require('path');

const server = express();
const port = 80;

// Setup middleware
server.use(express.json());

// Use routes
server.post("/receive-webhook", (req, res) => {
    console.log(req.body);
    res.json({'success': true});
});

// Start server on port
server.listen(port, () => {
    console.log('info', "", `Server is running on http://localhost:${port}`);
});