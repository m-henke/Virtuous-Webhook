const { format } = require("express/lib/response");
const axios = require("axios");

// Helper function to take virtuous formatted date and make it usable for mysql
function format_date(date) {
    const [month, day, year] = date.split('/');
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function gift_create(gift, pool) {
    return new Promise((resolve, reject) => {
        const gift_query = "INSERT INTO gifts (GiftID, Amount, GiftType, GiftDate, ContactID, IndividualID, SegmentCode) VALUES (?, ?, ?, ?, ?, ?, ?);";
        const values = [gift.id, gift.amount, gift.giftType, format_date(gift.giftDateFormatted), gift.contactId, gift.contactIndividualId, gift.segmentCode];
        pool.query(gift_query, values, (err, response) => {
            if (err) {
                return reject(err);
            }
            return resolve(response);
        })
    });
}

function update_contact_gift_info(gift, pool) {
    return new Promise((resolve, reject) => {
        const contact_update_query = "UPDATE contacts SET LastGiftAmount = ?, LastGiftDate = ? WHERE ContactID = ?;";
        pool.query(contact_update_query, [gift.amount, format_date(gift.giftDateFormatted), gift.contactId], (err, response) => {
            if (err) {
                return reject(err);
            }
            return resolve(response);
        })
    });
}

async function create_new_segment(gift, pool) {
    const seg_response = await axios.get(`https://api.virtuoussoftware.com/api/Segment/Code/${gift.segmentCode}`, 
        {headers: {'Authorization': `Bearer ${process.env.VIRTUOUS_TOKN}`}});
    
    if (seg_response.status != 200) {
        throw new Error(response.statusText);
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

    return new Promise((resolve, reject) => {
        Promise.all([
            new Promise((res, rej) => {
                pool.query(campaign_query, [new_segment.campaignId, new_segment.campaignName], (err) => {
                    if (err) {
                        return rej(err);
                    }
                    res();
                });
            }),
            new Promise((res, rej) => {
                pool.query(communication_query, [new_segment.communicationId, new_communication.name, new_communication.channelType, new_segment.campaignId], (err) => {
                    if (err) {
                        return rej(err);
                    }
                    res();
                });
            }),
            new Promise((res, rej) => {
                pool.query(segment_query, [new_segment.id, new_segment.code, new_segment.name, new_segment.campaignId], (err) => {
                    if (err) {
                        return rej(err);
                    }
                    res();
                });
            })
        ]).then(() => {
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
}

function run_gift_create(data, pool) {
    return new Promise((resolve, reject) => {
        gift_create(data.gift, pool).then(() => {
            update_contact_gift_info(data.gift, pool).then((response) => {
                return resolve(response);
            }).catch((err) => {
                return reject(err);
            });
        }).catch(err => {
            if (err.code == 'ER_NO_REFERENCED_ROW_2') {
                create_new_segment(data.gift, pool).then(() => {
                    return gift_create(data.gift, pool);
                }).then(() => {
                    return update_contact_gift_info(data.gift, pool);
                }).then(() => {
                    return resolve();
                }).catch(seg_err => {
                    return reject(seg_err);
                })
            }
        });
    });
}

module.exports = {
    run_gift_create
}