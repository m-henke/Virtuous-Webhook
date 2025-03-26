const { query_async } = require('./contact_create');
const axios = require("axios");

// Helper function to take virtuous formatted date and make it usable for mysql
function format_date(date) {
    const [month, day, year] = date.split('/');
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

async function handle_bad_project_codes(gift) {
    const bad_codes = ["2263", "2300", "2305"];
    for (let i = 0; i < gift.giftDesignations.length; i++) {
        if (bad_codes.includes(gift.giftDesignations[i].projectCode)) {
            gift.amount -= gift.giftDesignations[i].amountDesignated;
        }
    }
    return gift;
}

async function gift_create(gift, pool) {
    const gift_query = "INSERT INTO gifts (GiftID, Amount, GiftType, GiftDate, ContactID, IndividualID, SegmentCode) VALUES (?, ?, ?, ?, ?, ?, ?);";
    if (gift.giftType == "Electronic Funds Transfer") {
        gift.giftType = "EFT";
    }

    const seg_response = await axios.get(`https://api.virtuoussoftware.com/api/Segment/Code/${gift.segmentCode}`, 
        {headers: {'Authorization': `Bearer ${process.env.VIRTUOUS_TOKN}`}});

    if (seg_response.status != 200) {
        throw new Error(seg_response.statusText);
    }

    const values = [gift.id, gift.amount, gift.giftType, format_date(gift.giftDateFormatted), gift.contactId, gift.contactIndividualId, gift.segmentCode, seg_response.data.communicationName];
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
    try {
        if (data.gift.contactPassthroughId != null) {
            data.gift.contactId = data.gift.contactPassthroughId;
        }
        data.gift = await handle_bad_project_codes(data.gift);
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