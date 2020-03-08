const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const Scheduler = require('./src/excersize_scheduler');
const { getDayModel } = require('./src/sheets_parse');
const { currTimeStr } = require('./src/helpers');
const readline = require('readline');

const SlackMessage =  require('./src/slack/SlackMessage');
const { sendSlackMessage, sendTestMessage } = require('./src/slack_wrapper');

const SEND_MORNING_MESSAGE = false;


/* Partial flow used from: https://www.youtube.com/watch?v=8XBNz7cKvsc */

var config = JSON.parse(fs.readFileSync('./config.json'));
console.log("Config loaded!");

const scheduler = new Scheduler(config.google_sheet_id, config.google_sheet_range);

scheduler.start(30);

// TODO: schedule this for every morning (cron?)
if (SEND_MORNING_MESSAGE) sendSlackMorningMessage();

scheduler.on('excersize', excersizeModel => {
    sendSlackExcersize(excersizeModel)
});

initExpressApp();

//postMessage(config.webhook_url, slackBody);
// sendTestMessage('TEST!');

function sendSlackExcersize (excersizeModel) {
    const {time, excersize} = excersizeModel;
    let slackMessage = new SlackMessage(`ITS TIME FOR ${excersize.toUpperCase()} MAGGOTS!`);
    slackMessage.addAttachment(`*${excersize}*`);
    sendSlackMessage(slackMessage);
}

async function sendSlackMorningMessage() {
    try {
        const todayExcersizes = await getDayModel(config.google_sheet_id, config.google_sheet_range);
        const slackMessage = new SlackMessage(
            `MORNING LADIES! IT IS ${currTimeStr()}.\nHere are your excesizes for the day:`);

        todayExcersizes.forEach(excersizeModel => {  
            const { time, excersize } = excersizeModel;
            slackMessage.addAttachment(`*${time}*\t${excersize}`, 'none');
        });

        sendSlackMessage(slackMessage);
    } catch (err) { console.error(err)}
}

function initExpressApp(){
    const app = express();
    app.use(bodyParser.json());

    app.get('/', (req, res) => {
        console.log("Home hit!");
        res.end("HIT!");
    });

    app.post('/v1/send/', (req, res) => {
        const reqBody = req.body;
        console.log(`message received from ${req.ip}. Text: ${reqBody.text}`);
        
        const slackMessage = SlackMessage.fromObject(reqBody);
        if (!slackMessage) {
            res.statusCode = 400;
            res.send('Bad Request: Slack Message could not be created from body!');
        }
        else {
            res.end();
            sendSlackMessage(slackMessage);
        }
    })
    
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
    console.log(`Express app listening on port ${config.port}!`);
}


function commandLoop(){
    console.log('x');
    rl.question(code => {
        console.log('res' + code);
        try { eval(code); }
        catch (err) { console.error(err); }

        commandLoop();
    });
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });


commandLoop();