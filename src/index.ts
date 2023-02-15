import * as $$ from "richierich";

import {
    addOptionResponse,
    addStreamResult,
    addSubResults,
    getExpOrResponse,
    getExpOrStatus,
    getFormattedOptions,
    getOptionCases,
    getSubResult,
    hasResponse,
} from "./helpers";
import { ExtPipe, Pipe, PipeResult, PipeStore } from "./types";

var globalStore: PipeStore;

export const and: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    options.initialStatus = true;
    options.reducer = (acc: boolean, curr: boolean) => acc && curr;
    options.responseFilter = (result: PipeResult, subResult: PipeResult) =>
        result?.status === subResult?.status;
    const result = await compare(options, stream, localStore);
    return result;
};

export const append: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    let result = await getSubResult(options, stream);
    let appendResult = $$.omit(options, "pipes");
    result = { ...result, ...appendResult };
    return result;
};

export const compare: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    const result: PipeResult = {};
    result.status = $$.getKeyBool(options, "initialStatus");
    result.response = [];
    if ($$.hasKeyFunc(options, "reducer")) {
        await addSubResults(options, stream, result);
    }
    addOptionResponse(options, result);
    return result;
};

export const ifElse: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    const [condition, nextPipe]: [boolean, number] = await getExpOrStatus(
        options,
        stream
    );
    const result = condition
        ? await getSubResult(options, stream, nextPipe)
        : await getSubResult(options, stream, nextPipe + 1);
    return result;
};

export const not: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    let result: PipeResult = {};
    const subResult: PipeResult = await getSubResult(options, stream);
    result.status = !subResult.status;
    if ($$.hasKey(options, "response")) result.response = options.response;
    else if (hasResponse(subResult)) result.response = subResult.response;
    return result;
};

export const or: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    options.initialStatus = false;
    options.reducer = (acc: boolean, curr: boolean) => acc || curr;
    options.responseFilter = (result: PipeResult, subResult: PipeResult) =>
        result?.status === subResult?.status;
    const result: PipeResult = await compare(options, stream, localStore);
    return result;
};

export const returnFalse: Pipe = async (stream = {}) => ({
    status: false,
});

export const returnTrue: Pipe = async (stream = {}) => ({
    status: true,
});

export const setArr: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    const result: PipeResult = {};
    const { name, optional, value } = options;
    if (name && $$.isArr(value) && value.length) {
        (stream.data ??= {})[name] = value;
        result.status = true;
    } else {
        result.status = !!optional || false;
    }
    result.response = options.response;
    return result;
};

export const setBool: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    const result: PipeResult = {};
    const { name, optional, value } = options;
    if (name && $$.isBool(value)) {
        (stream.data ??= {})[name] = value;
        result.status = true;
    } else {
        result.status = !!optional || false;
    }
    result.response = options.response;
    return result;
};

export const setNum: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    const result: PipeResult = {};
    const { name, optional, value } = options;
    if (name && $$.isNum(value)) {
        (stream.data ??= {})[name] = value;
        result.status = true;
    } else {
        result.status = !!optional || false;
    }
    result.response = options.response;
    return result;
};

export const setObj: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    const result: PipeResult = {};
    const { name, optional, value } = options;
    if (name && $$.isObj(value)) {
        (stream.data ??= {})[name] = value;
        result.status = true;
    } else {
        result.status = !!optional || false;
    }
    result.response = options.response;
    return result;
};

export const setStore = (store?: PipeStore) => {
    globalStore = store ? { ...exports, ...store } : { ...exports };
};

export const setStr: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    const result: PipeResult = {};
    const { name, optional, value } = options;
    if (name && $$.isStr(value) && value) {
        (stream.data ??= {})[name] = value;
        result.status = true;
    } else {
        result.status = !!optional || false;
    }
    result.response = options.response;
    return result;
};

export const switchBlock: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    const exp = await getExpOrResponse(options, stream);
    const cases = getOptionCases(options);
    const result: PipeResult = await then(
        {
            pipes: [
                switchExp.bind(null, { exp }),
                ...cases.map(([value, pipe]) =>
                    switchCaseBreak.bind(null, { value, pipe })
                ),
                switchDefault.bind(null, options.default),
            ],
        },
        stream
    );
    return result;
};

export const switchBreak: Pipe = async (stream = {}) => {
    let result: PipeResult = {};
    result.status = true;
    if ($$.hasKey(stream, "switchExp")) stream.switchExp = undefined;
    if ($$.hasKey(stream, "switchMatched")) stream.switchMatched = undefined;
    return result;
};

export const switchCase: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    let result: PipeResult = {};
    result.status = true;
    if (stream.switchExp === options.value || stream.switchMatched) {
        result = await getSubResult(options, stream);
        stream.switchMatched = true;
    }
    return result;
};

export const switchCaseBreak: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    let result: PipeResult = {};
    result.status = true;
    if (stream.switchExp === options.value || stream.switchMatched) {
        result = await getSubResult(options, stream);
        stream.switchMatched = true;
        await switchBreak(stream);
    }
    return result;
};

export const switchDefault: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    let result: PipeResult = {};
    result.status = true;
    if ($$.hasKey(stream, "switchExp") && stream.switchMatched === false) {
        result = await getSubResult(options, stream);
        await switchBreak(stream);
    }
    return result;
};

export const switchExp: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    let result: PipeResult = {};
    const [exp] = await getExpOrResponse(options, stream);
    if (exp) stream.switchExp = exp;
    stream.switchMatched = false;
    result.status = $$.hasKey(stream, "switchExp");
    return result;
};

export const then: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    let result: PipeResult = {};
    result.status = true;
    for (let pipe of $$.getKeyArr(options, "pipes")) {
        if (!$$.getKey(result, "status", true)) break;
        result = await pipe(stream);
        if (options.disableResultPropagation) continue;
        addStreamResult(stream, result);
    }
    return result;
};
