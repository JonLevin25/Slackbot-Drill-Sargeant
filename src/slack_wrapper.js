const fs = require('fs');
const path = require('path');

const request = require('request-promise');

const SlackMessage = require('./slack/SlackMessage');

const SECRETS_PATH = path.resolve(__dirname, '../secrets/slack_secrets.json');
const slack_secrets = JSON.parse(fs.readFileSync(SECRETS_PATH));
const webhook_url = slack_secrets.slack_webhook_url;

const sendTestMessage = () => sendSlackMessage(new SlackMessage('Test!', markDown = true));
const sendSlackMessage = async function(slackMessage){
    if (!(slackMessage) instanceof SlackMessage)
        console.error('sendSlackMessage expects param of type SlackMessage!');

    try {
        console.log(webhook_url);
        const res = await request({
            uri: webhook_url,
            method: 'POST',
            body: slackMessage.requestBody,
            json: true
        });
        
        console.log(`Message sent successfully to slack. Response: ${res}`);
    } catch (e){
        console.error(e);
    }

    debugger;
};

module.exports = { sendSlackMessage, sendTestMessage };

// JUST FOR TESTING!
// sendTestMessage();