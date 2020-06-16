const valid_column = 0;
const message_column = 1;
const time_column = 2;
const the_day_column = 3;
const everyday_column = 4;
const monday_column = 5;
const tuesday_column = 6;
const wednesday_column = 7;
const thursday_column = 8;
const friday_column = 9;
const saturday_column = 10;
const sunday_column = 11;
const n_th_day_column = 12;

function main() {
    const line_token: string = SpreadsheetApp.getActive().getSheetByName("設定").getRange(2, 2).getValue();
    const max_row_number: number = 20;
    const targets = SpreadsheetApp.getActive().getSheetByName("main").getRange(3, 1, max_row_number, 5).getValues();
    const today: Date = new Date();

    for (let row: number = 0; row < 20; row++) {
        if (check(targets[row], today)) {
            post_line_notify(line_token, targets[row][message_column])
        }
    }
}

function check(target_row, today: Date): boolean {
//  必須チェック
    if (target_row.length == 0 || !target_row[valid_column] || !target_row[message_column] || !target_row[time_column]) {
        return false
    }
    const target_time = target_row[time_column];

    if (target_row[the_day_column]) { // 特定日付
        const the_day = new Date(target_row[the_day_column]);
        if (the_day.getFullYear() == today.getFullYear()
            && the_day.getMonth() == today.getMonth()
            && the_day.getDate() == today.getDate()) {

            return check_time(target_time, today)
        }
    } else if (target_row[monday_column] // 曜日
        || target_row[tuesday_column]
        || target_row[wednesday_column]
        || target_row[thursday_column]
        || target_row[friday_column]
        || target_row[saturday_column]
        || target_row[sunday_column]) {
        if (today.getDay() == 0 && target_row[sunday_column]) {
            return check_time(target_time, today)
        } else if (today.getDay() == 1 && target_row[monday_column]) {
            return check_time(target_time, today)
        } else if (today.getDay() == 2 && target_row[tuesday_column]) {
            return check_time(target_time, today)
        } else if (today.getDay() == 3 && target_row[wednesday_column]) {
            return check_time(target_time, today)
        } else if (today.getDay() == 4 && target_row[thursday_column]) {
            return check_time(target_time, today)
        } else if (today.getDay() == 5 && target_row[friday_column]) {
            return check_time(target_time, today)
        } else if (today.getDay() == 6 && target_row[saturday_column]) {
            return check_time(target_time, today)
        }
    }

    return check_time(target_time, today) // 毎日
}

function check_time(the_day: Date, today: Date): boolean {
    return the_day.getHours() == today.getHours()
        && the_day.getMinutes() == today.getMinutes();
}

// LINE Notifyを利用するための関数
function post_line_notify(token: string, content: string): void {
    const options =
        {
            "method": "post",
            "payload": {"message": content},
            "headers": {"Authorization": "Bearer " + token}
        };
    UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
}
