const Scheduler = require('./src/excersize_scheduler');
const { getDayModel } = require('./src/sheets_parse');
const { currTimeStr } = require('./src/helpers');
const readline = require('readline');
const { initExpressApp } = require('./src/server');
const cron = require('cron');

const SlackMessage =  require('./src/slack/SlackMessage');
const { sendSlackMessage, sendTestMessage } = require('./src/slack_wrapper');

const SEND_MORNING_MESSAGE_ON_INIT = false;


/* Partial flow used from: https://www.youtube.com/watch?v=8XBNz7cKvsc */

var config = require('./config.json');
console.log("Config loaded!");

const scheduler = new Scheduler(config.google_sheet_id, config.google_sheet_range);

scheduler.start(30);

// TODO: schedule this for every morning (cron?)
if (SEND_MORNING_MESSAGE_ON_INIT) sendSlackMorningMessage();

// Send every day [Sun-Thu] @ 10:00am 
const cron_time = '00 00 10 * * 0-4';
const morning_message_job = new cron.CronJob(cron_time, sendSlackMorningMessage);
morning_message_job.start();

scheduler.on('excersize', excersizeModel => {
    sendSlackExcersize(excersizeModel)
});

initExpressApp();

//postMessage(config.webhook_url, slackBody);
// sendTestMessage('TEST!');

function sendSlackExcersize (excersizeModel) {
    const { time, excersize } = excersizeModel;
    let slackMessage = new SlackMessage(`ITS TIME FOR ${excersize.toUpperCase()} MAGGOTS!`);
    slackMessage.addAttachment(`*${excersize}*`);
    sendSlackMessage(slackMessage);
}

async function sendSlackMorningMessage() {
    console.log('Sending morning message!')
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