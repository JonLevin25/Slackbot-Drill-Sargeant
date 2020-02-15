const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const Scheduler = require('./src/excersize_scheduler');

const SlackMessage =  require('./src/slack/SlackMessage');
const { sendSlackMessage, sendTestMessage } = require('./src/slack_wrapper');

/* Partial flow used from: https://www.youtube.com/watch?v=8XBNz7cKvsc */

const config = JSON.parse(fs.readFileSync('./config.json'));
console.log("Config loaded!");

// Init
const app = express();
app.use(bodyParser.json());
const scheduler = new Scheduler(config.google_sheet_id, config.google_sheet_range);
scheduler.start(30);

const sendSlackExcersize = (excersizeModel) => {
    const {time, excersize} = excersizeModel;
    let slackMessage = new SlackMessage(`ITS TIME FOR ${excersize} MAGGOTS!`);
    slackMessage.addAttachment(`*${excersize}* [${time}]`);
    sendSlackMessage(slackMessage);
}

scheduler.on('excersize', excersizeModel => {
    sendSlackExcersize(excersizeModel)
})


// --- UNUSED --- 
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

//postMessage(config.webhook_url, slackBody);

app.listen(config.port);

// sendTestMessage('TEST!');