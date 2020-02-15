class SlackMessage{
    constructor(text, markDown = true){
        this.requestBody = {
            text,
            mkdwn: markDown
        }
    }
    
    setText(text){
        this.requestBody.text = text;
        return this;
    }

    addAttachment(text, color='good'){
        if (!this.requestBody.attachments){
            this.requestBody.attachments = [];
        }

        this.requestBody.attachments.push({ text, color });
        return this;
    }
}

// const slackBody = {
//     mkdwn: true,
//     text: `My slack message`,
//     attachments: [{
//         color: 'good',
//         text: 'test text'
//     }]
// };

module.exports = SlackMessage;
