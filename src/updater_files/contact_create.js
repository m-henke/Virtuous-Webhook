const { format } = require("mysql2");

// Helper function used to get phone number in a usable format
function formatPhoneNumber(phoneNumber) {
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
                phone = formatPhoneNumber(method.value);
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
function getTodaysDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function tag_create(tag, contactID, pool) {
    return new Promise((resolve, reject) => {
        const select_query = `SELECT TagID FROM tags WHERE TagName = ?;`;
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
            pool.query(tag_history_query, [contactID, results[0].TagID, getTodaysDate(), null], (err, results) => {
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
            pool.query(org_history_query, [contactID, results[0].OrgGroupID, getTodaysDate(), null], (err, results) => {
                if (err) {
                    return reject(err);
                }
                return resolve(results);
            });
        });
    });
}

module.exports = {
    contact_create,
    individual_create,
    tag_create,
    org_group_create,
    getTodaysDate,
    formatPhoneNumber
}