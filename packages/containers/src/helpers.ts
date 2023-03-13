import * as $$ from "richierich";
import {
    DateObjectUnits,
    DateTime,
    DateTimeJSOptions,
    DateTimeOptions,
} from "luxon";

export const formatDateTime = (
    dateTime: string | DateObjectUnits,
    options?: DateTimeOptions | DateTimeJSOptions
) => {
    const formattedDateTime = $$.isStr(dateTime)
        ? DateTime.fromFormat(
              parseDateTimeStr(<string>dateTime),
              "D TT",
              options
          )
        : DateTime.fromObject(<DateObjectUnits>dateTime, options);
    return formattedDateTime.toUnixInteger();
};

export const parseDate = (date: string = "") => {
    let dateArr = date.split(/[\/\\._-]+/);
    if (dateArr.length === 1) dateArr.push("01");
    if (dateArr.length === 2) dateArr.push("0000");
    if (dateArr.length > 3) dateArr.slice(-3);
    return dateArr.join("/");
};

export const parseDateTimeStr = (dateTime: string) => {
    const dateTimeArr = dateTime.split(/[\s,]+/);
    const date = parseDate(dateTimeArr[0]);
    const time = parseTime(dateTimeArr[1], dateTimeArr[2]);
    return `${date} ${time}`;
};

export const parseTime = (time: string = "", period?: string) => {
    const timeArr = time.split(":");
    for (let i = 0; i < 3; i++) {
        timeArr[i] = timeArr[i] ? timeArr[i] : "00";
    }
    if (period === "AM" && +timeArr[0] > 12)
        timeArr[0] = String(+timeArr[0] - 12);
    if (period === "PM" && +timeArr[0] <= 12)
        timeArr[0] = +timeArr[0] < 12 ? String(+timeArr[0] + 12) : "00";
    if (timeArr.length > 3) timeArr.slice(-3);
    return timeArr.join(":");
};
