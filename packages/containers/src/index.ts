import {
    addOptionResponse,
    getFormattedArgs,
} from "@plumber/core/dist/helpers";
import { isArr, isBool, isNum, isObj, isStr, nowInS } from "richierich";
import {
    Pipe,
    PipeResult,
    WithOptionsAndStream,
} from "@plumber/core/dist/types";

import { formatDateTime } from "./helpers";

export const setArr: Pipe<WithOptionsAndStream> = (...args) => {
    const { options, stream } = getFormattedArgs(args);
    const result: PipeResult = {};
    const { name, optional, value } = options;
    if (name && isArr(value) && value.length) {
        (stream.data ??= {})[name] = value;
        result.status = true;
    } else {
        result.status = !!optional || false;
    }
    addOptionResponse(options, result);
    return result;
};

export const setBool: Pipe<WithOptionsAndStream> = (...args) => {
    const { options, stream } = getFormattedArgs(args);
    const result: PipeResult = {};
    const { name, optional, value } = options;
    if (name && isBool(value)) {
        (stream.data ??= {})[name] = value;
        result.status = true;
    } else {
        result.status = !!optional || false;
    }
    addOptionResponse(options, result);
    return result;
};

export const setNum: Pipe<WithOptionsAndStream> = (...args) => {
    const { options, stream } = getFormattedArgs(args);
    const result: PipeResult = {};
    const { name, optional, value } = options;
    if (name && isNum(value)) {
        (stream.data ??= {})[name] = value;
        result.status = true;
    } else {
        result.status = !!optional || false;
    }
    addOptionResponse(options, result);
    return result;
};

export const setObj: Pipe<WithOptionsAndStream> = (...args) => {
    const { options, stream } = getFormattedArgs(args);
    const result: PipeResult = {};
    const { name, optional, value } = options;
    if (name && isObj(value)) {
        (stream.data ??= {})[name] = value;
        result.status = true;
    } else {
        result.status = !!optional || false;
    }
    addOptionResponse(options, result);
    return result;
};

export const setStr: Pipe<WithOptionsAndStream> = (...args) => {
    const { options, stream } = getFormattedArgs(args);
    const result: PipeResult = {};
    const { name, optional, value } = options;
    if (name && isStr(value) && value) {
        (stream.data ??= {})[name] = value;
        result.status = true;
    } else {
        result.status = !!optional || false;
    }
    addOptionResponse(options, result);
    return result;
};

export const setTime: Pipe<WithOptionsAndStream> = (...args) => {
    const { options, stream } = getFormattedArgs(args);
    const result: PipeResult = {};
    let { name, value, zone, locale } = options;
    if (name) {
        (stream.data ??= {})[name] =
            isStr(value) || isObj(value)
                ? formatDateTime(value, { zone, locale })
                : nowInS();
        result.status = true;
    } else {
        result.status = false;
    }
    addOptionResponse(options, result);
    return result;
};
