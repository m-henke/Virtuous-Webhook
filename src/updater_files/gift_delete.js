const { format_date } = require('./gift_create')

async function update_contact_last_gift(gift, pool) {
    return new Promise(async (resolve, reject) => {
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

        const select_query = "SELECT LastGiftAmount, LastGiftDate FROM contacts WHERE ContactID = ?;";
        const last_gift_info = await queryAsync(select_query, [gift.contactId]).catch((err) => {
            return reject(err);
        });

        if (last_gift_info.length == 0) {
            return resolve();
        }

        if (gift.amount == last_gift_info[0].LastGiftAmount && format_date(gift.giftDateFormatted) == last_gift_info[0].LastGiftDate) {
            const select_prev_gift_query = "SELECT Amount, GiftDate FROM gifts WHERE ContactID = ? ORDER BY GiftDate DESC;";
            const old_gifts = await queryAsync(select_prev_gift_query, [gift.contactId]).catch((err) => {
                return reject(err);
            });

            if (old_gifts.length == 0) {
                return resolve();
            }

            const update_contact_query = "UPDATE contacts SET LastGiftAmount = ?, LastGiftDate = ? WHERE ContactID = ?;";
            await queryAsync(update_contact_query, [old_gifts[0].Amount, old_gifts[0].GiftDate, gift.contactId]).catch((err) => {
                return reject(err);
            })
            return resolve();
        } else {
            return resolve();
        }
    });
}

function delete_gift(gift, pool) {
    return new Promise((resolve, reject) => {
        const delete_query = "DELETE FROM gifts WHERE GiftID = ?;";
        pool.query(delete_query, [gift.id], (err, response) => {
            if (err) {
                return reject(err);
            }
            return resolve(response);
        });
    });
}

function run_gift_delete(data, pool) {
    return new Promise((resolve, reject) => {
        delete_gift(data.gift, pool).then(() => {
            update_contact_last_gift(data.gift, pool).then(() => {
                return resolve();
            }).catch((err) => {
                return reject(err);
            });
        }).catch((err) => {
            return reject(err);
        });
    })
}

module.exports = {
    run_gift_delete
}