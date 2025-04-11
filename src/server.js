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
    user: process.env.LOCAL_DB_USER,
    password: process.env.LOCAL_DB_PSWD,
    database: "VirtuousDB",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Recieves and routes data posted to the server
server.post("/receive-webhook", async (req, res) => {
    const data = req.body;
    console.log(`Webhook Received: ${data.event} with ${data.models.length} requests`)
    try {
        switch (data.event) {
            case "ContactCreate":
                for (let request in data.models) {
                    try {
                        await run_contact_create(request, pool);
                    } catch {
                        notify_teams(err, data.event);
                    }
                }
                break;
            case "ContactUpdate":
                for (let request in data.models) {
                    try {
                        await run_contact_update(request, pool);
                    } catch {
                        notify_teams(err, data.event);
                    }
                }
                break;
            case "GiftCreate":
                for (let request in data.models) {
                    try {
                        await run_gift_create(request, pool);
                    } catch {
                        notify_teams(err, data.event);
                    }
                }
                break;
            case "GiftUpdate":
                for (let request in data.models) {
                    try {
                        await run_gift_update(request, pool);
                    } catch {
                        notify_teams(err, data.event);
                    }
                }
                break;
            case "GiftDelete":
                for (let request in data.models) {
                    try {
                        await run_gift_delete(request, pool);
                    } catch {
                        notify_teams(err, data.event);
                    }
                }
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