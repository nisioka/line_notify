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
    const line_token = SpreadsheetApp.getActive().getSheetByName("設定").getRange(2, 2).getValue();
    const max_row_number = 20;
    const targets = SpreadsheetApp.getActive().getSheetByName("main").getRange(3, 1, max_row_number, 5).getValues();
    const today = new Date();

    for (let row = 0; row < 20; row++) {
        if (check(targets[row], today)) {
            post_line_notify(line_token, targets[row][message_column])
        }
    }
}

function check(target_row, today) {
//  必須チェック
    if (target_row.length == 0 || !target_row[valid_column] || !target_row[message_column] || !target_row[time_column]) {
        return false
    }


    if (target_row[the_day_column]) {
        const the_day = new Date(target_row[the_day_column]);
        console.log("year: " + today.getFullYear() + the_day.getFullYear());
        console.log("month: " + today.getMonth() + the_day.getMonth());
        console.log("day: " + today.getDate() + the_day.getDate());
        if (today.getFullYear() != the_day.getFullYear()
            || today.getMonth() != the_day.getMonth()
            || today.getDate() != the_day.getDate()) {
            return false
        }
    } else if (target_row[monday_column]
        || target_row[tuesday_column]
        || target_row[wednesday_column]
        || target_row[thursday_column]
        || target_row[friday_column]
        || target_row[saturday_column]
        || target_row[sunday_column]) {

    }
    return true
}

function check_time(the_day, today) {
    return the_day.getHours() == today.getHours()
        && the_day.getMinutes() == today.getMinutes();
}

function main_loop(userKey, queryUrl, queryKey, menthonCode, message, postUrl) {

    // Re:dashのクエリデータリフレッシュ。
    const options =
        {
            "headers": {
                "Authorization": userKey
            },
            "method": "post"
        };
    UrlFetchApp.fetch(queryUrl + "refresh", options);
    Utilities.sleep(10000); // 直ぐにはリフレッシュされない。本当はリフレッシュされたか検証したいが、10秒待つことで回避。

    var response = UrlFetchApp.fetch(queryUrl + "results.csv?api_key=" + queryKey);
    var csv = Utilities.parseCsv(response.getContentText("UTF-8"));
    if (csv.length <= 1) {
        return; // 取引がなかったり、休日にはRedashからデータが返ってこないようにしているので、その時は何もしない。
    }

    // 書き込みファイル作成
    var wrightSS = SpreadsheetApp.create(Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy_MM_dd'));
    wrightSS.getSheets()[0].getRange(1, 1, csv.length, csv[0].length).setValues(csv);

    // 移動(コピー&削除)
    var file = DriveApp.getFileById(wrightSS.getId());
    var nichiji_order = DriveApp.getFolderById("14iQdUf2T5f0R5_SfzKCD69AcpCq5S1Ui").addFile(file);
    DriveApp.getRootFolder().removeFile(file);

    // 通知準備
    var slack_message = String.fromCharCode(10) + message + String.fromCharCode(10) + String.fromCharCode(10) + nichiji_order.getFilesByName(file.getName()).next().getUrl();

    notifySlack(menthonCode + slack_message, postUrl)
}

function notifySlack(message, postUrl) {
    var jsonData =
        {
            "text": message
        };
    var payload = JSON.stringify(jsonData);

    var options =
        {
            "method": "post",
            "contentType": "application/json",
            "payload": payload
        };

    UrlFetchApp.fetch(postUrl, options);
}

// LINE Notifyを利用するための関数
function post_line_notify(token, content) {
    var options =
        {
            "method": "post",
            "payload": {"message": content},
            "headers": {"Authorization": "Bearer " + token}
        };

    UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
}
