const datetime = require('date-fns');
const axios = require('axios');

function notify_teams(ErrorMessage, Location) {
    const url = process.env.TEAMS_WEBHOOK;
    const currentDate = new Date();
    if (ErrorMessage instanceof Error) {
        ErrorMessage = ErrorMessage.message;
    }
    let data = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "summary": "Error Occurred",
        "themeColor": "ff0000",
        "title": "Virtuous Webhook Error",
        "sections": [
            {
            "facts": [
                {
                "name": "Date:",
                "value": `${datetime.format(currentDate, 'yyyy-MM-dd')}`
                },
                {
                "name": "Time:",
                "value": `${datetime.format(currentDate, 'HH:mm:ss')}`
                },
                {
                "name": "Location",
                "value": `${Location}`
                },
                {
                "name": "Error:",
                "value": `${ErrorMessage}`
                }
            ]
            }
        ]
    }

    axios.post(url, data, {
        headers: {'Content-Type': 'application/json'}
    }).catch(error => {
        console.log(error);
    });
}

module.exports = {
    notify_teams
}