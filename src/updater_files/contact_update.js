const { response } = require("express");
const { tag_create, org_group_create, getTodaysDate, formatPhoneNumber } = require("./contact_create")

function contact_update(contact, pool) {
    return new Promise((resolve, reject) => {
        const contact_query = "UPDATE contacts SET ContactName = ?, ContactType = ? WHERE ContactID = ?;";
        pool.query(contact_query, [contact.name, contact.contactType, contact.id], (err, response) => {
            if (err) {
                return reject(err);
            }
            return resolve(response);
        })
    })
}

function individual_update(individual, pool) {
    return new Promise((resolve, reject) => {
        const individual_query = "UPDATE individuals SET FirstName = ?, LastName = ?, PhoneNumber = ?, Email = ? WHERE IndividualID = ?;";
        var values = [individual.firstName, individual.lastName];

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

        values.push(phone, email, individual.id);

        pool.query(individual_query, values, (err, response) => {
            if (err) {
                return reject(err);
            }
            return resolve(response);
        });
    });
}

function tag_update(tags, contactID, pool) {
    return new Promise((resolve, reject) => {
        get_tags_query = "SELECT ct.TagID, t.TagName FROM contact_tags ct JOIN tags t ON ct.TagID = t.TagID WHERE ct.ContactID = ?;";
        pool.query(get_tags_query, [contactID], (err, response) => {
            if (err) {
                return reject(err);
            }

            // Add new tags to database
            var tag_data = {};
            for (let i = 0; i < tags.length; i++) {
                for (let j = 0; j < response.length; j++) {
                    // Tag already in db
                    if (tags[i] == response[j].TagName) {
                        tag_data[tags[i]] = true;
                        break;
                    }
                }
                // Add new tag
                if (tag_data[tags[i]] == undefined) {
                    tag_create(tags[i], contactID, pool).catch(err => {
                        console.error(err);
                    })
                }
            }

            // Remove old tags from database
            for (let i = 0; i < response.length; i++) {
                if (tag_data[response[i].TagName] == undefined) {
                    tag_history_query = "UPDATE tag_history SET DateRemoved = ? WHERE ContactID = ? and TagID = ?;";
                    pool.query(tag_history_query, [getTodaysDate(), contactID, response[i].TagID], (err) => {
                        if (err) {
                            return reject(err);
                        }
                    });
                    contact_tag_query = "DELETE FROM contact_tags WHERE ContactID = ? and TagID = ?;";
                    pool.query(contact_tag_query, [contactID, response[i].TagID], (err) => {
                        if (err) {
                            return reject(err);
                        }
                    });
                }
            }

            return resolve(response);
        });
    });
}

function org_group_update(org_groups, contactID, pool) {
    return new Promise((resolve, reject) => {
        get_orgs_query = "SELECT co.OrgGroupID, o.OrgGroupName FROM contact_org_groups co JOIN org_groups o ON co.OrgGroupID = o.OrgGroupID WHERE co.ContactID = ?;";
        pool.query(get_orgs_query, [contactID], (err, response) => {
            if (err) {
                return reject(err);
            }

            // Add new orgs to database
            var org_data = {};
            for (let i = 0; i < org_groups.length; i++) {
                for (let j = 0; j < response.length; j++) {
                    // Org already in db
                    if (org_groups[i] == response[j].OrgGroupName) {
                        org_data[org_groups[i]] = true;
                        break;
                    }
                }
                // Add new org
                if (org_data[org_groups[i]] == undefined) {
                    org_group_create(org_groups[i], contactID, pool).catch(err => {
                        console.error(err);
                    });
                }
            }

            // Remove old orgs from database
            for (let i = 0; i < response.length; i++) {
                if (org_data[response[i].OrgGroupName] == undefined) {
                    org_history_query = "UPDATE org_group_history SET DateRemoved = ? WHERE ContactID = ? and OrgGroupID = ?;";
                    pool.query(org_history_query, [getTodaysDate(), contactID, response[i].OrgGroupID], (err) => {
                        if (err) {
                            return reject(err);
                        }
                    });
                    contact_org_query = "DELETE FROM contact_org_groups WHERE ContactID = ? and OrgGroupID = ?;";
                    pool.query(contact_org_query, [contactID, response[i].OrgGroupID], (err) => {
                        if (err) {
                            return reject(err);
                        }
                    });
                }
            }

            return resolve(response);
        });
    });
}

module.exports = {
    contact_update,
    individual_update,
    tag_update,
    org_group_update
}