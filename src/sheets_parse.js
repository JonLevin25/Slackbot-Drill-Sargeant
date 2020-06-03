const authorize = require("./google_sheets/sheets_auth");
const {google} = require("googleapis");
const fs = require('fs');
const { compareTimeStrings, todayShortDayStr } = require('./helpers');

// Parse a sheet range into an object of form:
// { Sun: [[<time1>, <excersize1>], [time2, excersize2]], Mon: [...] ... }
// Where each day is garunteed to be sorted by <time>
//
// See google_sheets/sheets/test.js `listMajors` for sheet_id/range value example
const getWeekModel = async (sheet_id, range) => {
    const auth = await authorize()
    return await parseWithAuth(auth, sheet_id, range);
};

/* Get the model for a given day, default to today */
const getDayModel = async (sheet_id, range, day = null) => {
    const weekModel = await getWeekModel(sheet_id, range);
    
    // default to today
    if (!day) day = todayShortDayStr();

    return weekModel[day];
}

function parseWithAuth(auth, sheet_id, range) {
    return new Promise((resolve, reject) => {
        const sheets = google.sheets({ version: 'v4', auth });

        sheets.spreadsheets.values.get({
            spreadsheetId: sheet_id,
            range: range,
        }, (err, res) => {
            if (err) return reject(err);
            
            //testWrite(res);
            const [header, ...rows] = res.data.values;
            const parsedModel = parseRowsSorted(header, rows);
            resolve(parsedModel);
        });
    });
}

// Returns dict of days, key = day, value = array of (time, excersize) pairs
//
function parseRowsSorted(header, rows){
    if (!rows.length) return console.log('No data found.');
    // TODO: better validation on header/rows? or validate before this called

    const [_, ...days] = header; // Get rid of first 'time' column

    // Init result
    const weekModel = {}
    days.forEach(day => {
        weekModel[day] = [];
    });

    rows.forEach(row => {
        const [time, ...excersizesByDay] = row;
        excersizesByDay.map((excersize, i) => ({
            day: days[i],
            excersize
        }))
        .filter(x => !!x.excersize) // get rid of empty excersizes
        .forEach((x, i) => {
            const day = days[i];
            weekModel[day].push({time, excersize: x.excersize});12
        });
    });
    
    // Sort day (array of [time, excersize] pairs) by time
    days.forEach(day => {
        dayModel = weekModel[day];
        dayModel.sort((day1, day2) => compareTimeStrings(day1.time, day2.time));
    })

    return weekModel;
}

function testWrite(obj){
    fs.writeFile('sheets_test_response.json', 
        JSON.stringify(obj), (err) => {
            if (err) return console.error(err);
    });
}

module.exports = { getWeekModel, getDayModel };


// TESTING - remove
// const configPath = require('path').resolve(__dirname, '../config.json');
// const config = JSON.parse(fs.readFileSync(configPath));
// getWeekModel(config.google_sheet_id, config.google_sheet_range).then(console.log).catch(console.error);