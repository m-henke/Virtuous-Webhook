const { format_date, create_new_segment, handle_bad_project_codes } = require('./gift_create');
const { update_contact_last_gift } = require('./gift_delete');
const { query_async } = require('./contact_create');

async function gift_update(gift, pool) {
    const response = await query_async(pool, "SELECT SegmentCode FROM gifts WHERE GiftID = ?;", [gift.id]);
    var gift_query = null;
    if (gift.giftType == "Electronic Funds Transfer") {
        gift.giftType = "EFT";
    }
    if (response[0].SegmentCode == gift.segmentCode) {
        gift_query = "UPDATE gifts SET Amount = ?, GiftType = ?, GiftDate = ? WHERE GiftID = ?;";
        const values = [gift.amount, gift.giftType, format_date(gift.giftDateFormatted), gift.id];
    } else {
        gift_query = "UPDATE gifts SET Amount = ?, GiftType = ?, GiftDate = ?, SegmentCode = ?, CommunicationName = ? WHERE GiftID = ?;";
        const seg_response = await axios.get(`https://api.virtuoussoftware.com/api/Segment/Code/${gift.segmentCode}`, 
            {headers: {'Authorization': `Bearer ${process.env.VIRTUOUS_TOKN}`}});
        if (seg_response.status != 200) {
            throw new Error(seg_response.statusText);
        }
        const values = [gift.amount, gift.giftType, format_date(gift.giftDateFormatted), gift.segmentCode, seg_response.data.communicationName, gift.id];
    }
    await query_async(pool, gift_query, values);
}

async function run_gift_update(data, pool) {
    try {
        if (data.gift.contactPassthroughId != null) {
            data.gift.contactId = data.gift.contactPassthroughId;
        }
        data.gift = await handle_bad_project_codes(data.gift)
        await gift_update(data.gift, pool);
        await update_contact_last_gift(data.gift, pool);
        return Promise.resolve();
    } catch (err) {
        if (err.code == 'ER_NO_REFERENCED_ROW_2') {
            try {
                await create_new_segment(data.gift, pool);
                await gift_update(data.gift, pool);
                await update_contact_last_gift(data.gift, pool);
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
    run_gift_update
}