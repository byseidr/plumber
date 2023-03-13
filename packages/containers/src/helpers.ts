import { lead } from "richierich";
import { DateObj } from "./types";

export const dateObjToStr = (dateObj: DateObj) => {
    const { year, month, day } = dateObj;
    const date = [year, ...[month, day].map((num) => lead(num))].join("-");
    const { hour, minute, seconds } = dateObj;
    const time = [hour, minute, seconds].map((num) => lead(num ?? 0)).join(":");
    let { offset } = dateObj;
    return `${date}T${time}${parseDateTimeOffset(offset)}`;
};

export const parseDateTimeOffset = (offset: number | string = "+00:00") => {
    const result = offset.toString().split(":");
    result[0] = result[0].replace(
        /([-+]?)(\d+)/,
        (match, sign, hour) => (sign ? sign : "+") + lead(hour)
    );
    if (result.length === 1) result.push("00");
    return result.join(":");
};
