import {
    addOptionResponse,
    getFormattedOptions,
} from "@plumber/core/dist/helpers";
import { isArr, isBool, isNum, isObj, isStr, nowInS } from "richierich";
import {
    Pipe,
    PipeResult,
    WithOptionsAndStream,
} from "@plumber/core/dist/types";

import { addData, formatDateTime } from "./helpers";

export const setArr: Pipe<WithOptionsAndStream> = (options, stream = {}) => {
    options = getFormattedOptions(options, stream);
    const result = addData(options, stream, isArr);
    return result;
};

export const setBool: Pipe<WithOptionsAndStream> = (options, stream = {}) => {
    options = getFormattedOptions(options, stream);
    const result = addData(options, stream, isBool);
    return result;
};

export const setNum: Pipe<WithOptionsAndStream> = (options, stream = {}) => {
    options = getFormattedOptions(options, stream);
    const result = addData(options, stream, isNum);
    return result;
};

export const setObj: Pipe<WithOptionsAndStream> = (options, stream = {}) => {
    options = getFormattedOptions(options, stream);
    const result = addData(options, stream, isObj);
    return result;
};

export const setStr: Pipe<WithOptionsAndStream> = (options, stream = {}) => {
    options = getFormattedOptions(options, stream);
    const result = addData(options, stream, isStr);
    return result;
};

export const setTime: Pipe<WithOptionsAndStream> = (options, stream = {}) => {
    options = getFormattedOptions(options, stream);
    const result: PipeResult = {};
    let { name, optional, value, zone, locale } = options;
    if (name) {
        (stream.data ??= {})[name] =
            isStr(value) || isObj(value)
                ? formatDateTime(value, { zone, locale })
                : nowInS();
        result.status = true;
    } else {
        result.status = !!optional || false;
    }
    addOptionResponse(options, result);
    return result;
};
