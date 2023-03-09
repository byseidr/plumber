import * as $$ from "richierich";
import {
    addOptionResponse,
    getFormattedArgs,
} from "@plumber/core/dist/helpers";
import { Fitting, FittingResult } from "@plumber/core/dist/types";

export const setArr: Fitting = (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const result: FittingResult = {};
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

export const setBool: Fitting = (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const result: FittingResult = {};
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

export const setNum: Fitting = (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const result: FittingResult = {};
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

export const setObj: Fitting = (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const result: FittingResult = {};
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

export const setStr: Fitting = (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const result: FittingResult = {};
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

export const setTime: Fitting = (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const result: FittingResult = {};
    const { name } = options;
    if (name) {
        (stream.data ??= {})[name] = $$.nowInS();
        result.status = true;
    } else {
        result.status = false;
    }
    addOptionResponse(options, result);
    return result;
};
