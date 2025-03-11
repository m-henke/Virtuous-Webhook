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
    return new Promise(async (resolve, reject) => {
        let found = false;
        const select_query = "SELECT TagID FROM tags WHERE TagName = ?;";

        const queryAsync = (query, params) => {
            return new Promise((resolve, reject) => {
                pool.query(query, params, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                });
            });
        };

        const results = await queryAsync(select_query, [tag]).catch((err) => {
            return reject(err);
        });
        
        if (results.length > 0) {
            found = true;
        }

        if (!found) {
            const response = await axios.post("https://api.virtuoussoftware.com/api/Tag/Search?take=100", 
                {'search': tag}, 
                {headers:{'Authorization': `Bearer ${process.env.VIRTUOUS_TOKN}`}});
            let new_tag = null;
            for (const found_tag of response.data.list) {
                if (found_tag.tagName == tag) {
                    new_tag = found_tag;
                    break;
                }
            }
            if (new_tag == null) {
                return reject("New tag not found in Virtuous");
            }
            const insert_tag_query = "INSERT INTO tags (TagID, TagName) VALUES (?, ?);";
            await queryAsync(insert_tag_query, [new_tag.id, new_tag.tagName]);
        }

        const finalResults = await queryAsync(select_query, [tag]);
        const insert_contact_tag_query = "INSERT IGNORE INTO contact_tags (ContactID, TagID) VALUES (?, ?);";
        const insert_tag_history_query = "INSERT INTO tag_history (ContactID, TagID, DateAdded, DateRemoved) VALUES (?, ?, ?, ?);";
        await queryAsync(insert_contact_tag_query, [contactID, finalResults[0].TagID]).catch((err) => {
            return reject(err);
        });
        await queryAsync(insert_tag_history_query, [contactID, finalResults[0].TagID, get_todays_date(), null]).catch((err) => {
            return reject(err);
        });
        return resolve();
    });
}

function org_group_create(org, contactID, pool) {
    return new Promise(async (resolve, reject) => {
        let found = false;
        const select_query = "SELECT OrgGroupID FROM org_groups WHERE OrgGroupName = ?;";

        const queryAsync = (query, params) => {
            return new Promise((resolve, reject) => {
                pool.query(query, params, (err, results) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(results);
                });
            });
        };

        const results = await queryAsync(select_query, [org]).catch((err) => {
            return reject(err);
        });

        if (results.length > 0) {
            found = true;
        }

        if (!found) {
            const response = await axios.get(`https://api.virtuoussoftware.com/api/OrganizationGroup/ByContact/${contactID}`, 
                {headers:{'Authorization': `Bearer ${process.env.VIRTUOUS_TOKN}`}});
            let new_org = null;
            for (const found_org of response.data) {
                if (found_org.name == org) {
                    new_org = found_org;
                    break;
                }
            }
            if (new_org == null) {
                return reject("New org not found in Virtuous");
            }
            const insert_org_query = "INSERT INTO org_groups (OrgGroupID, OrgGroupName) VALUES (?, ?);";
            await queryAsync(insert_org_query, [new_org.id, new_org.name]);
        }

        const finalResults = await queryAsync(select_query, [org]);
        const insert_contact_org_query = "INSERT INTO contact_org_groups (ContactID, OrgGroupID) VALUES (?, ?);";
        const insert_org_history_query = "INSERT INTO org_group_history (ContactID, OrgGroupID, DateAdded, DateRemoved) VALUES (?, ?, ?, ?);";
        await queryAsync(insert_contact_org_query, [contactID, finalResults[0].OrgGroupID]).catch((err) => {
            return reject(err);
        });
        await queryAsync(insert_org_history_query, [contactID, finalResults[0].OrgGroupID, get_todays_date(), null]).catch((err) => {
            return reject(err);
        });
        return resolve();
    });
}

async function run_contact_create(data, pool) {
    try {
        await contact_create(data.contact, pool);
        for (let i = 0; i < data.contact.contactIndividuals.length; i++) {
            await individual_create(data.contact.contactIndividuals[i], data.contact.id, pool);
        }

        for (let i = 0; i < data.contact.tags.length; i++) {
            await tag_create(data.contact.tags[i], data.contact.id, pool);
        }

        for (let i = 0; i < data.contact.organizationGroups.length; i++) {
            await org_group_create(data.contact.organizationGroups[i], data.contact.id, pool);
        }

        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}

module.exports = {
    tag_create,
    org_group_create,
    get_todays_date,
    format_phone_number,
    run_contact_create
}