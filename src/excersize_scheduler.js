const EventEmitter = require('events');
const { parse } = require('./sheets_parse');
const {todayShortDayStr, currTimeStr, timeStringInRangeExclusive: timeStrInRangeExclusive} = require('./helpers');

class Scheduler extends EventEmitter{
    start(sheet_id, sheet_range, updateMs){
        this.sheet_id = sheet_id;
        this.sheet_range = sheet_range;
        this.day = todayShortDayStr();
        this.lastTickTimeStr = currTimeStr();
        // setInterval(update, updateMs);
    }

    update(){
        console.log("update!");
        parse()
    }
    
    getExcersizes(dayStr, startTimeStr, endTimeStr){
        return parse(this.sheet_id, this.sheet_range)
            .then(weekModel => {
                const today_excersizes = weekModel[dayStr];
                return today_excersizes.filter(day => timeStrInRangeExclusive(day[0], startTimeStr, endTimeStr));
            })
    }
}

// TESTS
const sched = new Scheduler();
sched.start('1j2qYteoEAysMf1lzSR3_W5UP6gWYyeVw31lOkYv5Gso', 'WeeklySchedule!A1:H12', 30*1000);
sched.getExcersizes(todayShortDayStr(), '10:00', '12:00')
    .then(excersizes => console.log(JSON.stringify(excersizes)))
    .catch(err => console.error(`Error: ${JSON.stringify(err)}`));