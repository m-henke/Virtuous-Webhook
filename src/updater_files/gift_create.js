const { query_async, individual_create } = require('./contact_create');
const axios = require("axios");

// Helper function to take virtuous formatted date and make it usable for mysql
function format_date(date) {
    const [month, day, year] = date.split('/');
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

async function handle_bad_project_codes(gift) {
    const good_codes = ["4000", "1101", "1102", "1103", "1104"];
    for (let i = 0; i < gift.giftDesignations.length; i++) {
        if (!good_codes.includes(gift.giftDesignations[i].projectCode)) {
            gift.amount -= gift.giftDesignations[i].amountDesignated;
        }
    }
    return gift;
}

async function individual_exists(individualId, pool) {
    const individual_query = "SELECT * FROM individuals WHERE IndividualID = ?;"
    const individual_response = await query_async(pool, individual_query, [individualId]);
    return individual_response.length > 0;
}

async function gift_create(gift, pool) {
    const gift_query = "INSERT INTO gifts (GiftID, Amount, GiftType, GiftDate, ContactID, IndividualID, SegmentCode, CommunicationName, ReceiptStatus, Note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
    if (gift.giftType == "Electronic Funds Transfer") {
        gift.giftType = "EFT";
    }

    const seg_response = await axios.get(`https://api.virtuoussoftware.com/api/Segment/Code/${gift.segmentCode}`, 
        {headers: {'Authorization': `Bearer ${process.env.VIRTUOUS_TOKN}`}});

    if (seg_response.status != 200) {
        throw new Error(seg_response.statusText);
    }

    if (gift.contactIndividualId) {
        const exists = await individual_exists(gift.contactIndividualId, pool);
        if (!exists) {
            const individual_req_response = await axios.get(`https://api.virtuoussoftware.com/api/ContactIndividual/${gift.contactIndividualId}`, 
                {headers: {'Authorization': `Bearer ${process.env.VIRTUOUS_TOKN}`}});
            await individual_create(individual_req_response.data, gift.contactId, pool);
        }
    } else {
        const individual_response = await axios.get(`https://api.virtuoussoftware.com/api/ContactIndividual/ByContact/${gift.contactId}`, 
            {headers: {'Authorization': `Bearer ${process.env.VIRTUOUS_TOKN}`}});
        for (let ind of individual_response.data) {
            if (ind.isPrimary) {
                const exists = await individual_exists(ind.id, pool);
                if (!exists) {
                    await individual_create(ind, gift.contactId, pool);
                }
                break;
            }
        }
    }

    const values = [gift.id, gift.amount, gift.giftType, format_date(gift.giftDateFormatted), gift.contactId, gift.contactIndividualId, gift.segmentCode, seg_response.data.communicationName, gift.customFields["Receipt Status"], gift.notes];
    await query_async(pool, gift_query, values);
}

async function update_contact_gift_info(gift, pool) {
    const contact_update_query = "UPDATE contacts SET LastGiftAmount = ?, LastGiftDate = ? WHERE ContactID = ?;";
    const values = [gift.amount, format_date(gift.giftDateFormatted), gift.contactId];
    await query_async(pool, contact_update_query, values);
}

async function create_new_segment(gift, pool) {
    const seg_response = await axios.get(`https://api.virtuoussoftware.com/api/Segment/Code/${gift.segmentCode}`, 
        {headers: {'Authorization': `Bearer ${process.env.VIRTUOUS_TOKN}`}});
    
    if (seg_response.status != 200) {
        throw new Error(seg_response.statusText);
    }

    const com_response = await axios.get(`https://api.virtuoussoftware.com/api/Communication/${seg_response.data.communicationId}`, 
        {headers: {'Authorization': `Bearer ${process.env.VIRTUOUS_TOKN}`}});

    if (com_response.status != 200) {
        throw new Error(com_response.statusText);
    }

    const campaign_query = "INSERT IGNORE INTO campaigns (CampaignID, CampaignName) VALUES (?, ?);";
    const communication_query = "INSERT IGNORE INTO communications (CommunicationID, CommunicationName, ChannelType, CampaignID) VALUES (?, ?, ?, ?);";
    const segment_query = "INSERT IGNORE INTO segments (SegmentID, SegmentCode, SegmentName, CampaignID) VALUES (?, ?, ?, ?);";

    const new_segment = seg_response.data;
    const new_communication = com_response.data;

    await query_async(pool, campaign_query, [new_segment.campaignId, new_segment.campaignName]);
    await query_async(pool, communication_query, [new_segment.communicationId, new_communication.name, new_communication.channelType, new_segment.campaignId]);
    await query_async(pool, segment_query, [new_segment.id, new_segment.code, new_segment.name, new_segment.campaignId]);
}

async function run_gift_create(data, pool) {
    data.gift.contactId = data.gift.contactPassthroughId || data.gift.contactId;
    data.gift.segmentCode = data.gift.segmentCode || "F2FY23ONB";
    try {
        data.gift = await handle_bad_project_codes(data.gift);
        // If the gift create was for a bad code return promise resolved
        // This is to prevent an error when it tires to create a gift that doesn't need to be in the system
        if (data.gift.amount == 0) {
            return Promise.resolve();
        }
        await gift_create(data.gift, pool);
        await update_contact_gift_info(data.gift, pool);
        return Promise.resolve();
    } catch (err) {
        if (err.code == 'ER_NO_REFERENCED_ROW_2') {
            try {
                await create_new_segment(data.gift, pool);
                await gift_create(data.gift, pool);
                await update_contact_gift_info(data.gift, pool);
                return Promise.resolve();
            } catch (seg_err) {
                return Promise.reject(seg_err);
            }
        } else {
            return Promise.reject(err);
        }
    }
}

module.exports = {
    run_gift_create,
    format_date,
    update_contact_gift_info,
    handle_bad_project_codes,
    create_new_segment
}