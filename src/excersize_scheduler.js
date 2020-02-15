const EventEmitter = require('events');
const { parse } = require('sheets_parse');
const {todayShortDayStr, currTimeStr, compareTimeStrings} = require('./helpers');

class scheduler extends EventEmitter{
    start(updateMs){
        this.day = todayShortDayStr();
        this.lastTickTimeStr = currTimeStr();
        setInterval(update, updateMs);
    }

    update(){
        console.log("update!");
        parse()
    }
}

