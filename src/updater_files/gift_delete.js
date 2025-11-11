const { query_async } = require('./contact_create');
const { format_date } = require('./gift_create')

async function update_contact_last_gift(gift, pool) {
    const contactID_query = "SELECT ContactID FROM gifts WHERE GiftID = ?;";
    const id_response = await query_async(pool, contactID_query, [gift.id]);
    
    if (id_response.length == 0) {
        return;
    }

    const contactId = id_response[0].ContactID;

    const select_query = "SELECT LastGiftAmount, LastGiftDate FROM contacts WHERE ContactID = ?;";
    const last_gift_info = await query_async(pool, select_query, [contactId]);

    if (last_gift_info.length == 0) {
        return;
    }

    if (Number(gift.amount) == Number(last_gift_info[0].LastGiftAmount) && new Date(format_date(gift.giftDateFormatted)).toISOString().split('T')[0] == new Date(last_gift_info[0].LastGiftDate).toISOString().split('T')[0]) {
        const select_prev_gift_query = "SELECT Amount, GiftDate FROM gifts WHERE ContactID = ? ORDER BY GiftDate DESC;";
        const old_gifts = await query_async(pool, select_prev_gift_query, [contactId]);

        if (old_gifts.length == 0) {
            return;
        }

        const update_contact_query = "UPDATE contacts SET LastGiftAmount = ?, LastGiftDate = ? WHERE ContactID = ?;";
        await query_async(pool, update_contact_query, [old_gifts[0].Amount, old_gifts[0].GiftDate, contactId]);
    }
}

async function delete_gift(gift, pool) {
    const delete_query = "DELETE FROM gifts WHERE GiftID = ?;";
    await query_async(pool, delete_query, [gift.id]);
}

async function run_gift_delete(data, pool) {
    try {
        await delete_gift(data, pool);
        await update_contact_last_gift(data.gift, pool);
        return Promise.resolve();
    } catch (err) {
        return Promise.reject(err);
    }
}

module.exports = {
    update_contact_last_gift,
    run_gift_delete
}