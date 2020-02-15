const EventEmitter = require('events');
const { parse } = require('./sheets_parse');
const {todayShortDayStr, currTimeStr: nowTimeStr, timeStringInRangeExclusive: timeStrInRangeExclusive} = require('./helpers');

class Scheduler extends EventEmitter{
    start(sheet_id, sheet_range, updateMs){
        this.sheet_id = sheet_id;
        this.sheet_range = sheet_range;
        this.initialized = false; // init after first update

        this.day = todayShortDayStr();
        // this.lastTickTimeStr = nowTimeStr();
        // TESTING:L REMOVE!
        this.lastTickTimeStr = '00:00';
        
        const sched = this;
        setInterval(() => update(sched), updateMs);
        update(sched);
    }
}

function getExcersizes(scheduler, dayStr, startTimeStr, endTimeStr){
    return parse(scheduler.sheet_id, scheduler.sheet_range)
        .then(weekModel => {
            const today_excersizes = weekModel[dayStr];
            // console.log(`getExcersizes(${dayStr}, ${startTimeStr}, ${endTimeStr}). TODAY: ${today_excersizes}`);
            const excersizeModels = today_excersizes.filter(day => timeStrInRangeExclusive(day.time, startTimeStr, endTimeStr));
            return excersizeModels;
        })
}

function update(scheduler){
    const currTimeStr = nowTimeStr();
    const currDay = todayShortDayStr();
    //console.log(`update! currTime: ${currTimeStr}. LastTime: ${scheduler.lastTickTimeStr}`);

    const dayRollover = currDay !== scheduler.day;
    const rangeStart = dayRollover ? null : scheduler.lastTickTimeStr; // if day roll over disregard last timeStr
    
    // Disregard excersizes on first run, otherwise we'd send all excersizes till current time
    getExcersizes(scheduler, currDay, rangeStart, nowTimeStr())
    .then(excersizeModels => {
        //console.log(`Excersizes found: ${excersizeModels}`);
        excersizeModels.forEach(excersize => {
            // console.log('Excersize' + JSON.stringify(excersize));
            scheduler.emit('excersize', excersize)}
        )})
    .catch(err => console.error(`Error when getting excersizes: ${err}`));

    // scheduler.init = true;
    scheduler.day = currDay;
    scheduler.lastTickTimeStr = currTimeStr;
}

// TESTS
// const sched = new Scheduler();
// sched.on('excersize', console.log);
// sched.start('1j2qYteoEAysMf1lzSR3_W5UP6gWYyeVw31lOkYv5Gso', 'AllaBaballa!A1:H12', 30*1000);

// sched.getExcersizes(todayShortDayStr(), '15:00', '15:08')
//     .then(excersizes => console.log(JSON.stringify(excersizes)))
//     .catch(err => console.error(`Error: ${JSON.stringify(err)}`));