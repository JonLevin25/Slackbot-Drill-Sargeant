const authorize = require("./google_sheets/sheets_auth");
const {google} = require("googleapis");
const fs = require('fs');
const { compareTimeStrings } = require('./helpers');

// Parse a sheet range into an object of form:
// { Sun: [[<time1>, <excersize1>], [time2, excersize2]], Mon: [...] ... }
// Where each day is garunteed to be sorted by <time>
//
// See google_sheets/sheets/test.js `listMajors` for sheet_id/range value example
const parse = (sheet_id, range) => {
    authorize((auth) => {
        const sheets = google.sheets({version: 'v4', auth});
        sheets.spreadsheets.values.get({
        spreadsheetId: sheet_id,
        range: range,
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);

            testWrite(res);

            const [header, ...rows] = res.data.values;
            const parsedModel = parseRowsSorted(header, rows);
            console.log(parsedModel);
        });
    });
};

// Returns dict of days, key = day, value = array of (time, excersize) pairs
//
function parseRowsSorted(header, rows){
    if (!rows.length) return console.log('No data found.');
    // TODO: better validation on header/rows? or validate before this called

    const [_, ...days] = header; // Get rid of first 'time' column
    console.log("header: " + header);

    // Init result
    const weekModel = {}
    days.forEach(day => {
        weekModel[day] = [];
    });

    rows.map(row => {
        const [time, ...excersizesByDay] = row;
        excersizesByDay.map((excersize, i) => {
            const day = days[i];
            weekModel[day].push([time, excersize]);
        });
    });
    
    // Sort
    days.forEach(day => {
        dayModel = weekModel[day];

        console.log('sorting: ' + dayModel);

        // Sort day (array of [time, excersize] pairs) by time
        dayModel.sort((day1, day2) => compareTimeStrings(day1[0], day2[0]));
        console.log('sorted: ' + weekModel[day]);
    })

    return weekModel;
}

function testWrite(obj){
    fs.writeFile('sheets_test_response.json', 
        JSON.stringify(obj), (err) => {
            if (err) return console.error(err);
    });
}

module.exports = { parse };


// TESTING - remove
// const sheet_id = "1j2qYteoEAysMf1lzSR3_W5UP6gWYyeVw31lOkYv5Gso";
// const range = "WeeklySchedule!A1:H12";
// parse(sheet_id, range);