const express = require('express');
const mysql = require('mysql2');
const { contact_create, individual_create, tag_create, org_group_create } = require('./updater_files/contact_create')
const server = express();
const port = 80;

// Setup middleware
server.use(express.json());

// Create mysql connection pool
const pool = mysql.createPool({
    host: "100.93.36.64",
    user: "mike",
    password: "Bigfoot22!",
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
            contact_create(data.contact, pool).then(() => {
                for (let i = 0; i < data.contact.contactIndividuals.length; i++) {
                    individual_create(data.contact.contactIndividuals[i], data.contact.id, pool).catch(err => {
                        console.error(err);
                    });
                }
                for (let i = 0; i < data.contact.tags.length; i++) {
                    tag_create(data.contact.tags[i], data.contact.id, pool).catch(err => {
                        console.error(err);
                    });
                }
                // for (let i = 0; i < data.contact.organizationGroups.length; i++) {
                //     org_group_create(data.contact.organizationGroups[i], data.contact.id, pool).catch(err => {
                //         console.error(err);
                //     })
                // }
                res.status(200).send("success");
            }).catch(err => {
                console.error(err);
                res.status(500).send("failure");
            });
            break;
        case "ContactUpdate":
            contact_update(data.contact);
            break;
        case "GiftCreate":
            gift_create(data.gift);
            break;
        default:
            res.status(400).send('unsupported event');
    }
});

// Start server on port
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});