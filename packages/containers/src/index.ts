import * as $$ from "richierich";
import {
    addOptionResponse,
    getFormattedArgs,
} from "@plumber/core/dist/helpers";
import { DynamicPipe, PipeResult } from "@plumber/core/dist/types";

export const setArr: DynamicPipe = (...args) => {
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

export const setBool: DynamicPipe = (...args) => {
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

export const setNum: DynamicPipe = (...args) => {
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

export const setObj: DynamicPipe = (...args) => {
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

export const setStr: DynamicPipe = (...args) => {
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

export const setTime: DynamicPipe = (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const result: PipeResult = {};
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
