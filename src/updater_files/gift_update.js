const { format_date, update_contact_gift_info, create_new_segment } = require('./gift_create');

function gift_update(gift, pool) {
    return new Promise((resolve, reject) => {
        const gift_query = "UPDATE gifts SET Amount = ?, GiftType = ?, GiftDate = ?, SegmentCode = ? WHERE GiftID = ?;";
        pool.query(gift_query, [gift.amount, gift.giftType, format_date(gift.giftDateFormatted), gift.segmentCode, gift.id], (err, response) => {
            if (err) {
                return reject(err);
            }
            return resolve(response);
        })
    })
}

function run_gift_update(data, pool) {
    return new Promise((resolve, reject) => {
        gift_update(data.gift, pool).then(() => {
            update_contact_gift_info(data.gift, pool).then((response) => {
                return resolve(response);
            }).catch((err) => {
                return reject(err);
            });
        }).catch((err) => {
            if(err.code == 'ER_NO_REFERENCED_ROW_2') {
                create_new_segment(data.gift, pool).then(() => {
                    return gift_update(data.gift, pool);
                }).then(() => {
                    return update_contact_gift_info(data.gift, pool);
                }).then(() => {
                    return resolve();
                }).catch(seg_err => {
                    return reject(seg_err);
                });
            } else {
                return reject(err);
            }
        });
    });
}

module.exports = {
    run_gift_update
}