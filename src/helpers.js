const arbitraryDate = '01/01/2011';

const dayMap = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'
]

/* Compare times regardless of date (DONT USE if times may roll over to next day!) */
function compareTimeStrings(timeStr1, timeStr2){
    const date1 = Date.parse(`${arbitraryDate} ${timeStr1}`);
    const date2 = Date.parse(`${arbitraryDate} ${timeStr2}`);
    if (date1 < date2) return -1;
    if (date1 > date2) return +1;
    return 0;
}

function todayShortDayStr(){
    const i = new Date.getDay();
    return dayMap[i];
}

function currTimeStr(){
    const currDate = new Date();
    return currDate.toTimeString().substr(0, 8);
}

module.exports = {compareTimeStrings, todayShortDayStr, currTimeStr };