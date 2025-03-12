const { format_date, create_new_segment } = require('./gift_create');
const { update_contact_last_gift } = require('./gift_delete');
const { query_async } = require('./contact_create');

async function gift_update(gift, pool) {
    const gift_query = "UPDATE gifts SET Amount = ?, GiftType = ?, GiftDate = ?, SegmentCode = ? WHERE GiftID = ?;";
    const values = [gift.amount, gift.giftType, format_date(gift.giftDateFormatted), gift.segmentCode, gift.id];
    await query_async(pool, gift_query, values);
}

async function run_gift_update(data, pool) {
    try {
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