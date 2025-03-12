const express = require('express');
const mysql = require('mysql2');
const { run_contact_create } = require('./updater_files/contact_create');
const { run_contact_update } = require('./updater_files/contact_update');
const { run_gift_create } = require('./updater_files/gift_create');
const { run_gift_update } = require('./updater_files/gift_update');
const { run_gift_delete } = require('./updater_files/gift_delete');
const { notify_teams } = require('./utils/teams_notification');
const server = express();
const port = 80;

// Setup middleware
server.use(express.json());

// Create mysql connection pool
const pool = mysql.createPool({
    host: process.env.LOCAL_DB_HOST_IP,
    user: "mike",
    password: process.env.LOCAL_DB_MIKE_PSWD,
    database: "VirtuousDB",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Recieves and routes data posted to the server
server.post("/receive-webhook", async (req, res) => {
    const data = req.body;
    console.log(`Webhook Received: ${data.event}`)
    try {
        switch (data.event) {
            case "ContactCreate":
                await run_contact_create(data, pool);
                break;
            case "ContactUpdate":
                await run_contact_update(data, pool);
                break;
            case "GiftCreate":
                await run_gift_create(data, pool);
                break;
            case "GiftUpdate":
                await run_gift_update(data, pool);
                break;
            case "GiftDelete":
                await run_gift_delete(data, pool);
                break;
            default:
                throw new Error(`Unsupported ${data.event} event`);
        }
        res.status(200).send("success");
    } catch (err) {
        notify_teams(err, data.event);
        res.status(500).send("failure");
    }
});

// Start server on port
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});