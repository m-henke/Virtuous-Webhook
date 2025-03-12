const { tag_create, org_group_create, get_todays_date, format_phone_number, query_async } = require('./contact_create')

async function contact_update(contact, pool) {
    const query = "UPDATE contacts SET ContactName = ?, ContactType = ? WHERE ContactID = ?;";
    await query_async(pool, query, [contact.name, contact.contactType, contact.id]);
}

async function individual_update(individual, pool) {
    const query = "UPDATE individuals SET FirstName = ?, LastName = ?, PhoneNumber = ?, Email = ? WHERE IndividualID = ?;";
    var values = [individual.firstName, individual.lastName];

    var email = null;
    var phone = null;

    for (let method of individual.contactMethods) {
        if (method.type.toLowerCase().includes("email") && method.isPrimary) {
            email = method.value;
        } else if (method.type.toLowerCase().includes("phone") && method.isPrimary) {
            phone = format_phone_number(method.value);
        }
    }

    values.push(phone, email, individual.id);
    await query_async(pool, query, values);
}

async function tag_update(tags, contactID, pool) {
    const get_tags_query = "SELECT ct.TagID, t.TagName FROM contact_tags ct JOIN tags t ON ct.TagID = t.TagID WHERE ct.ContactID = ?;";
    const response = await query_async(pool, get_tags_query, [contactID]);
    
    // Add new tags
    var tag_data = {};
    for (let tag of tags) {
        for (let resp of response) {
            if (tag == resp.TagName) {
                tag_data[tag] = true;
            }
        }
        if (!tag_data[tag]) {
            await tag_create(tags[i], contactID, pool);
        }
    }

    // Remove old tags from database
    for (let resp of response) {
        if (!tag_data[resp.TagName]) {
            const tag_history_query = "UPDATE tag_history SET DateRemoved = ? WHERE ContactID = ? and TagID = ?;";
            await query_async(pool, tag_history_query, [get_todays_date(), contactID, resp.TagID]);

            const contact_tag_query = "DELETE FROM contact_tags WHERE ContactID = ? and TagID = ?;";
            await query_async(pool, contact_tag_query, [contactID, resp.TagID]);
        }
    }
}

async function org_group_update(org_groups, contactID, pool) {
    const get_orgs_query = "SELECT co.OrgGroupID, o.OrgGroupName FROM contact_org_groups co JOIN org_groups o ON co.OrgGroupID = o.OrgGroupID WHERE co.ContactID = ?;";
    const response = await query_async(pool, get_orgs_query, [contactID]);

    // Add new org groups
    var org_data = {};
    for (let org of org_groups) {
        for (let resp of response) {
            if (org == resp.OrgGroupName) {
                org_data[org] = true;
            }
        }
        if (!org_data[org]) {
            await org_group_create(org, contactID, pool);
        }
    }

    // Remove old org groups
    for (let resp of response) {
        if (!org_data[resp.OrgGroupName]) {
            const org_history_query = "UPDATE org_group_history SET DateRemoved = ? WHERE ContactID = ? and OrgGroupID = ?;";
            await query_async(pool, org_history_query, [get_todays_date(), contactID, resp.OrgGroupID]);
            
            const contact_org_query = "DELETE FROM contact_org_groups WHERE ContactID = ? and OrgGroupID = ?;";
            await query_async(pool, contact_org_query, [contactID, resp.OrgGroupID]);
        }
    }
}

async function run_contact_update(data, pool) {
    try {
        await contact_update(data.contact, pool);

        for (let i = 0; i < data.contact.contactIndividuals.length; i++) {
            await individual_update(data.contact.contactIndividuals[i], pool);
        }

        await tag_update(data.contact.tags, data.contact.id, pool);

        await org_group_update(data.contact.organizationGroups, data.contact.id, pool);

        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}

module.exports = {
    run_contact_update
}