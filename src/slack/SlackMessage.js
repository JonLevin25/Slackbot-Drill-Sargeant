const randomAttachmentColors = [
    // '#5400A8',
    '#A8002A',
    '#00a87e',
    '#002aa8',
    '#a87e00'
];

class SlackMessage{
    constructor(text, markDown = true){
        this.requestBody = {
            text,
            mkdwn: markDown,
            link_names: true
        }
    }

    static fromObject(obj){
        if (!obj.text) return null;
        return Object.assign(new SlackMessage(obj.text), obj);
    }
    
    setText(text){
        this.requestBody.text = text;
        return this;
    }

    addAttachment(text, color='random'){

        if (!this.requestBody.attachments){
            this.requestBody.attachments = [];
        }

        if (color === 'random'){
            color = randomAttachmentColors[Math.floor(Math.random() * randomAttachmentColors.length)]
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
