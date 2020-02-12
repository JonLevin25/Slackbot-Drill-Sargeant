const express = require('express');
// var Slackbot = require('slackbot')

//https://www.youtube.com/watch?v=8XBNz7cKvsc

const request = require('request-promise');
const fs = require('fs');
const hook_url = 'https://hooks.slack.com/services/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'
const bodyParser = require('body-parser')
const app = express();

const config = JSON.parse(fs.readFileSync('./config.json'));
console.log("Config loaded!")

app.use(bodyParser.json());

app.get('/', (req, res) => {
    console.log("Home hit!");
    res.end("HIT!");
});

app.post(config.route, (req, res) => {

    console.log(`request: ${req.body}`)
    if (req.body.type == 'url_verification'){
        let challenge = req.body.challenge;

        console.log(`responding with ${challenge}`)
        res.end(challenge);
    }
});

const postMessage = async function(hook_url, slackBody){
    try {
        const res = await request({
            url: hook_url,
            method: 'POST',
            body: slackBody,
            json: true
        });

    } catch (e){
        console.log("Error! " + e);
    }

    debugger;
};

const slackBody = {
    mkdwn: true,
    text: `My slack message`,
    attachments: [{
        color: 'good',
        text: 'test text'
    }]
};

//postMessage(config.webhook_url, slackBody);

app.listen(config.port, '0.0.0.0');