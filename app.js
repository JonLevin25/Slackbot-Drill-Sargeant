const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const Scheduler = require('./src/excersize_scheduler');
const { getDayModel } = require('./src/sheets_parse');
const { currTimeStr } = require('./src/helpers');

const SlackMessage =  require('./src/slack/SlackMessage');
const { sendSlackMessage, sendTestMessage } = require('./src/slack_wrapper');


/* Partial flow used from: https://www.youtube.com/watch?v=8XBNz7cKvsc */

var config = JSON.parse(fs.readFileSync('./config.json'));
console.log("Config loaded!");

const scheduler = new Scheduler(config.google_sheet_id, config.google_sheet_range);

scheduler.start(30);

// TODO: schedule this for every morning (cron?)
sendSlackMorningMessage();

scheduler.on('excersize', excersizeModel => {
    sendSlackExcersize(excersizeModel)
})

//postMessage(config.webhook_url, slackBody);
// sendTestMessage('TEST!');

function sendSlackExcersize (excersizeModel) {
    const {time, excersize} = excersizeModel;
    let slackMessage = new SlackMessage(`ITS TIME FOR ${excersize} MAGGOTS!`);
    slackMessage.addAttachment(`*${excersize}* [${time}]`);
    sendSlackMessage(slackMessage);
}

async function sendSlackMorningMessage() {
    try {
        const todayExcersizes = await getDayModel(config.google_sheet_id, config.google_sheet_range);
        const slackMessage = new SlackMessage(
            `MORNING LADIES! IT IS ${currTimeStr()}.\nHere are your excesizes for the day:`);

        todayExcersizes.forEach(excersizeModel => {  
            const { time, excersize } = excersizeModel;
            slackMessage.addAttachment(`*${time}*\t${excersize}`);
        });

        sendSlackMessage(slackMessage);
    } catch (err) { console.error(err)}
}

// --- UNUSED --- 
function InitExpressApp(){
    const app = express();
    app.use(bodyParser.json());

    app.get('/', (req, res) => {
        console.log("Home hit!");
        res.end("HIT!");
    });
    
    // Receive mentions from slack - currently unused
    app.post(config.route, (req, res) => {
        console.log(`request: ${req.body}`)
    
        // Slack route verification
        if (req.body.type == 'url_verification'){
            let challenge = req.body.challenge;
    
            console.log(`responding with ${challenge}`)
            res.end(challenge);
        }
    });
    
    app.listen(config.port);
}
