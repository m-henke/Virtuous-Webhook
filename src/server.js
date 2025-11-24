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
server.use(express.json({limit: '5mb'}));

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
    try {
        console.log(`Webhook Received: ${data.event} with ${data.models.length} requests`)
    } catch {
        console.log(`Webhook Received: ${data.event}`);
    }
    res.status(200).send("Received");
    let errors = [];
    try {
        switch (data.event) {
            case "ContactCreate":
                try {
                    for (let request of data.models) {
                        try {
                            await run_contact_create(request, pool);
                        } catch (err) {
                            errors.push(err);
                        }
                    }
                } catch {
                    await run_contact_create(data, pool);
                }
                break;
            case "ContactUpdate":
                try {
                    for (let request of data.models) {
                        try {
                            await run_contact_update(request, pool);
                        } catch (err) {
                            errors.push(err);
                        }
                    }
                } catch {
                    await run_contact_update(data, pool);
                }
                break;
            case "GiftCreate":
                try {
                    for (let request of data.models) {
                        try {
                            await run_gift_create(request, pool);
                        } catch (err) {
                            errors.push(err);
                        }
                    }
                } catch {
                    await run_gift_create(data, pool);
                }
                break;
            case "GiftUpdate":
                try {
                    for (let request of data.models) {
                        try {
                            await run_gift_update(request, pool);
                        } catch (err) {
                            errors.push(err);
                        }
                    }
                } catch {
                    await run_gift_update(data, pool);
                }
                break;
            case "GiftDelete":
                try {
                    for (let request of data.models) {
                        try {
                            await run_gift_delete(request, pool);
                        } catch (err) {
                            errors.push(err);
                        }
                    }
                } catch {
                    await run_gift_delete(data, pool);
                }
                break;
            default:
                throw new Error(`Unsupported ${data.event} event`);
        }
        if (errors.length > 0) {
            for (let error of errors) {
                notify_teams(error, data.event);
            }
            return;
        }
    } catch (err) {
        notify_teams(err, data.event);
    }
});

// Start server on port
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});