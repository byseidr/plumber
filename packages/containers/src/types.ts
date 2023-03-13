import { GenericRange, LargeRange } from "richierich/dist/types";

export type DateObj = {
    year: Year;
    month: Month;
    day: Day;
    hour?: Hour;
    minute?: Minute;
    seconds?: Seconds;
    offset?: TimeZoneOffset;
};

export type Day = GenericRange<1, 31>;

export type Hour = GenericRange<0, 59>;

export type Minute = GenericRange<0, 59>;

export type Month = GenericRange<1, 12>;

export type Seconds = GenericRange<0, 59>;

export type TimeZoneOffset =
    | number
    | `${"-" | "+" | ""}${LargeRange<0, 23>}${":00" | ""}`;

export type Year = number | string;
