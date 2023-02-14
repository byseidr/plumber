import * as $$ from "richierich";

import * as helpers from "./helpers";

import { ExtPipe, Pipe, PipeOptions, PipeResult, PipeStore } from "./types";

var globalStore: PipeStore;

export const and: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = helpers.getFormattedOptions(options, stream, localStore);
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
    options = helpers.getFormattedOptions(options, stream, localStore);
    let result = await helpers.getSubResult(options, stream);
    let appendResult = $$.omit(options, "pipes");
    result = { ...result, ...appendResult };
    return result;
};

export const compare: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = helpers.getFormattedOptions(options, stream, localStore);
    const result: PipeResult = {};
    result.status = $$.getKeyBool(options, "initialStatus");
    const response = $$.getKey(options, "response", []);
    if ($$.hasKeyFunc(options, "reducer")) {
        await helpers.addSubResults(options, stream, result, response);
    }
    if (!$$.isEmpty(response)) result.response = response;
    return result;
};

export const ifElse: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = helpers.getFormattedOptions(options, stream, localStore);
    const [condition, nextPipe]: [boolean, number] =
        await helpers.getExpOrStatus(options, stream);
    const result = condition
        ? await helpers.getSubResult(options, stream, nextPipe)
        : await helpers.getSubResult(options, stream, nextPipe + 1);
    return result;
};

export const not: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = helpers.getFormattedOptions(options, stream, localStore);
    const result: PipeResult = await helpers.getSubResult(options, stream);
    result.status = !result.status;
    if ($$.hasKey(options, "response")) result.response = options.response;
    else if (helpers.hasResponse(result)) result.response = result.response;
    return result;
};

export const or: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = helpers.getFormattedOptions(options, stream, localStore);
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

export const setStore = (store?: PipeStore) => {
    globalStore = store ? { ...exports, ...store } : { ...exports };
};

export const switchBlock: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = helpers.getFormattedOptions(options, stream, localStore);
    const exp = await helpers.getExpOrResponse(options, stream);
    const cases = helpers.getOptionCases(options);
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
    options = helpers.getFormattedOptions(options, stream, localStore);
    let result: PipeResult = {};
    result.status = true;
    if (stream.switchExp === options.value || stream.switchMatched) {
        result = await helpers.getSubResult(options, stream);
        stream.switchMatched = true;
    }
    return result;
};

export const switchCaseBreak: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = helpers.getFormattedOptions(options, stream, localStore);
    let result: PipeResult = {};
    result.status = true;
    if (stream.switchExp === options.value || stream.switchMatched) {
        result = await helpers.getSubResult(options, stream);
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
    options = helpers.getFormattedOptions(options, stream, localStore);
    let result: PipeResult = {};
    result.status = true;
    if ($$.hasKey(stream, "switchExp") && stream.switchMatched === false) {
        result = await helpers.getSubResult(options, stream);
        await switchBreak(stream);
    }
    return result;
};

export const switchExp: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = helpers.getFormattedOptions(options, stream, localStore);
    let result: PipeResult = {};
    const [exp] = await helpers.getExpOrResponse(options, stream);
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
    options = helpers.getFormattedOptions(options, stream, localStore);
    let result: PipeResult = {};
    result.status = true;
    for (let pipe of $$.getKeyArr(options, "pipes")) {
        if (!$$.getKey(result, "status", true)) continue;
        result = await pipe(stream);
        if (options.disableResultPropagation) continue;
        helpers.addStreamResult(stream, result);
    }
    return result;
};
