const axios = require('axios');

// Helper function used to get phone number in a usable format
function format_phone_number(phoneNumber) {
    // Too short to be a full number
    if (phoneNumber.length < 10) {
        return null;
    }
    // Remove country code
    if (phoneNumber.startsWith("+1")) {
        phoneNumber = phoneNumber.slice(2);
    }
    // Remove unnecessary characters
    const replaceList = ["(", ")", "-", " ", ".", "+", "\n"];
    replaceList.forEach(character => {
        phoneNumber = phoneNumber.split(character).join("");
    });
    // Remove trailing extension
    if (phoneNumber.length > 10 && phoneNumber[10].toLowerCase() === "e") {
        phoneNumber = phoneNumber.slice(0, 10);
    }
    // All formatting is done and it's not the right length
    if (phoneNumber.length !== 10) {
        return null;
    }
    // Contains non-digit characters
    if (!/^\d+$/.test(phoneNumber)) {
        return null;
    }
    return phoneNumber;
}

// Insert new contact
function contact_create(contact, pool) {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO contacts (ContactID, ContactName, ContactType, LastGiftAmount, LastGiftDate) VALUES (?, ?, ?, ?, ?);";
        const values = [contact.id, contact.name, contact.contactType, null, null];
        
        pool.query(query, values, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}

// Insert new individual
function individual_create(individual, contactID, pool) {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO individuals (IndividualID, ContactID, FirstName, LastName, PhoneNumber, Email) VALUES (?, ?, ?, ?, ?, ?);"
        var values = [individual.id, contactID, individual.firstName, individual.lastName];

        var email = null;
        var phone = null;

        for (let i = 0; i < individual.contactMethods.length; i++) {
            const method = individual.contactMethods[i];
            if (method.type.toLowerCase().includes("email") && method.isPrimary) {
                email = method.value;
            } else if (method.type.toLowerCase().includes("phone") && method.isPrimary) {
                phone = format_phone_number(method.value);
            }
        }

        values.push(phone, email);

        pool.query(query, values, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}

// Helper function to get the current date in mysql format
function get_todays_date() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

async function tag_create(tag, contactID, pool) {
    var found = false;
    const select_query = `SELECT TagID FROM tags WHERE TagName = ?;`;
    pool.query(select_query, [tag], (err, results) => {
        if (err) {
            return reject(err);
        }

        if (results.length > 0) {
            found = true;
        }
    });
    if (!found) {
        axios.post("https://api.virtuoussoftware.com/api/Tag/Search?take=1", 
            {headers:{'Authorization': `Bearer ${process.env.VIRTUOUS_TOKN}`}}, 
            {data: {"search": tag}})
            .then((response) => {
                const insert_query = "INSERT IGNORE INTO tags (TagID, TagName) VALUES (?, ?);";
                pool.query(insert_query, [response.list[0].id, response.list[0].tagName], (err) => {
                    if (err) {
                        throw new Error(err);
                    }
                })
            }).catch((err) => {
                throw new Error(err);
            });
    }
    return new Promise((resolve, reject) => {
        pool.query(select_query, [tag], (err, results) => {
            if (err) {
                return reject(err);
            }
            
            const insert_query = "INSERT INTO contact_tags (ContactID, TagID) VALUES (?, ?);"
            pool.query(insert_query, [contactID, results[0].TagID], (err) => {
                if (err) {
                    return reject(err);
                }
            });
            const tag_history_query = "INSERT INTO tag_history (ContactID, TagID, DateAdded, DateRemoved) VALUES (?, ?, ?, ?);"
            pool.query(tag_history_query, [contactID, results[0].TagID, get_todays_date(), null], (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve(results);
            });
        });
    });
}

function org_group_create(org, contactID, pool) {
    return new Promise((resolve, reject) => {
        const select_query = `SELECT OrgGroupID FROM org_groups WHERE OrgGroupName = ?;`;
        pool.query(select_query, [org], (err, results) => {
            if (err) {
                return reject(err);
            }
            const insert_query = "INSERT INTO contact_org_groups (ContactID, OrgGroupID) VALUES (?, ?);";
            pool.query(insert_query, [contactID, results[0].OrgGroupID], (err, results) => {
                if (err) {
                    return reject(err);
                }
            });
            const org_history_query = "INSERT INTO org_group_history (ContactID, OrgGroupID, DateAdded, DateRemoved) VALUES (?, ?, ?, ?);";
            pool.query(org_history_query, [contactID, results[0].OrgGroupID, get_todays_date(), null], (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve(results);
            });
        });
    });
}

function run_contact_create(data, pool) {
    return new Promise((resolve, reject) => {
        contact_create(data.contact, pool).then(() => {
            for (let i = 0; i < data.contact.contactIndividuals.length; i++) {
                individual_create(data.contact.contactIndividuals[i], data.contact.id, pool).catch(err => {
                    return reject(err);
                });
            }
            for (let i = 0; i < data.contact.tags.length; i++) {
                tag_create(data.contact.tags[i], data.contact.id, pool).catch(err => {
                    return reject(err);
                });
            }
            for (let i = 0; i < data.contact.organizationGroups.length; i++) {
                org_group_create(data.contact.organizationGroups[i], data.contact.id, pool).catch(err => {
                    return reject(err);
                })
            }
            return resolve();
        }).catch(err => {
            return reject(err);
        });
    });
}

module.exports = {
    tag_create,
    org_group_create,
    get_todays_date,
    format_phone_number,
    run_contact_create
}