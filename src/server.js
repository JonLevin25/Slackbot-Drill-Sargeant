const express = require('express');
const bodyParser = require('body-parser');

var config = require('../config.json');

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

module.exports = {
    initExpressApp 
};