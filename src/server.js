const express = require('express');
const mysql = require('mysql2');
const { run_contact_create } = require('./updater_files/contact_create');
const { run_contact_update } = require('./updater_files/contact_update');
const { run_gift_create } = require('./updater_files/gift_create');
const server = express();
const port = 80;

// Setup middleware
server.use(express.json());

// Create mysql connection pool
const pool = mysql.createPool({
    host: "100.93.36.64",
    user: "mike",
    password: process.env.LOCAL_DB_MIKE_PSWD,
    database: "VirtuousDB",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Recieves and routes data posted to the server
server.post("/receive-webhook", (req, res) => {
    const data = req.body;
    console.log(`Webhook Received: ${data.event}`)
    switch (data.event) {
        case "ContactCreate":
            run_contact_create(data, pool)
            .then(() => {
                res.status(200).send("success");
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("failure");
            })
            break;

        case "ContactUpdate":
            run_contact_update(data, pool)
            .then(() => {
                res.status(200).send("success");
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("failure");
            })
            break;

        case "GiftCreate":
            run_gift_create(data, pool)
            .then(() => {
                res.status(200).send("success");
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send("failure");
            })
            break;

        default:
            res.status(400).send('unsupported event');
    }
});

// Start server on port
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});