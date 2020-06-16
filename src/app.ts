const valid_column: number = 0;
const message_column: number = 1;
const time_column: number = 2;
const the_day_column: number = 3;
const everyday_column: number = 4;
const monday_column: number = 5;
const tuesday_column: number = 6;
const wednesday_column: number = 7;
const thursday_column: number = 8;
const friday_column: number = 9;
const saturday_column: number = 10;
const sunday_column: number = 11;
const n_th_day_column: number = 12;

/**
 * スプレッドシートに定義されたものが通知対象かをチェックする。
 * 設定と定義を読み込み、各行を判定する。
 */
function main(): void {
    const line_token: string = SpreadsheetApp.getActive().getSheetByName("設定").getRange(2, 2).getValue();
    const max_row_number: number = 20;
    const targets = SpreadsheetApp.getActive().getSheetByName("main").getRange(3, 1, max_row_number, 5).getValues();
    const today: Date = new Date();

    for (let row: number = 0; row < max_row_number; row++) {
        if (check(targets[row], today)) {
            post_line_notify(line_token, targets[row][message_column])
        }
    }
}

/**
 * 今は条件に満たしたタイミングかを判定する。時刻は分の精度。
 * 1. 必須チェックを行う。
 * 2-1. 特定日判定
 * 2-2. 曜日判定
 * 2-3. 毎日
 * @param target_row スプレッドシートの対象行
 * @param today 今日
 */
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
    } else if (target_row[n_th_day_column]) {
        const n_th_list: string = target_row[n_th_day_column];
        if (n_th_list.indexOf(get_n_th_of_month(today)) == -1){
            return false
        }
    } if (target_row[monday_column] // 曜日
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
        } else {
            return false
        }
    }

    return check_time(target_time, today) // 毎日
}

/**
 * 該当時刻かどうかを判定する。
 * @param the_day
 * @param today
 */
function check_time(the_day: Date, today: Date): boolean {
    return the_day.getHours() == today.getHours()
        && the_day.getMinutes() == today.getMinutes();
}

/**
 * その月の第何曜日かを取得する。
 * @param date 対象日
 */
function get_n_th_of_month(date): string{
    return (Math.floor((date.getDate() - 1) / 7) + 1).toString()
}

/**
 * LINE Notifyへポストする。
 * @param token LINE notifyトークン
 * @param content 表示メッセージ
 */
function post_line_notify(token: string, content: string): void {
    const options =
        {
            "method": "post",
            "payload": {"message": content},
            "headers": {"Authorization": "Bearer " + token}
        };
    UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
}
