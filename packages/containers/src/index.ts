import * as $$ from "richierich";
import {
    addOptionResponse,
    getFormattedArgs,
} from "@plumber/core/dist/helpers";
import {
    Pipe,
    PipeResult,
    WithOptionsAndStream,
} from "@plumber/core/dist/types";
import { dateObjToStr } from "./helpers";

export const setArr: Pipe<WithOptionsAndStream> = (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const result: PipeResult = {};
    const { name, optional, value } = options;
    if (name && $$.isArr(value) && value.length) {
        (stream.data ??= {})[name] = value;
        result.status = true;
    } else {
        result.status = !!optional || false;
    }
    addOptionResponse(options, result);
    return result;
};

export const setBool: Pipe<WithOptionsAndStream> = (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const result: PipeResult = {};
    const { name, optional, value } = options;
    if (name && $$.isBool(value)) {
        (stream.data ??= {})[name] = value;
        result.status = true;
    } else {
        result.status = !!optional || false;
    }
    addOptionResponse(options, result);
    return result;
};

export const setNum: Pipe<WithOptionsAndStream> = (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const result: PipeResult = {};
    const { name, optional, value } = options;
    if (name && $$.isNum(value)) {
        (stream.data ??= {})[name] = value;
        result.status = true;
    } else {
        result.status = !!optional || false;
    }
    addOptionResponse(options, result);
    return result;
};

export const setObj: Pipe<WithOptionsAndStream> = (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const result: PipeResult = {};
    const { name, optional, value } = options;
    if (name && $$.isObj(value)) {
        (stream.data ??= {})[name] = value;
        result.status = true;
    } else {
        result.status = !!optional || false;
    }
    addOptionResponse(options, result);
    return result;
};

export const setStr: Pipe<WithOptionsAndStream> = (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const result: PipeResult = {};
    const { name, optional, value } = options;
    if (name && $$.isStr(value) && value) {
        (stream.data ??= {})[name] = value;
        result.status = true;
    } else {
        result.status = !!optional || false;
    }
    addOptionResponse(options, result);
    return result;
};

export const setTime: Pipe<WithOptionsAndStream> = (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const result: PipeResult = {};
    let { name, value } = options;
    if (name) {
        if ($$.isObj(value) && $$.hasKeys(value, ["year", "month", "day"]))
            value = dateObjToStr(value);
        (stream.data ??= {})[name] = value
            ? new Date(value).getTime()
            : $$.nowInS();
        result.status = true;
    } else {
        result.status = false;
    }
    addOptionResponse(options, result);
    return result;
};
