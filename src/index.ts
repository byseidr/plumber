import * as $$ from "richierich";

import * as helpers from "./helpers";

import { ExtPipe, Pipe, PipeOptions, PipeResult, PipeStore } from "./types";

var globalStore: PipeStore;

export const and: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    (<PipeOptions>options).initialStatus = true;
    (<PipeOptions>options).reducer = (acc, curr) => acc && curr;
    (<PipeOptions>options).responseFilter = (result, subResult) =>
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
    let result = await helpers.getSubResult(<PipeOptions>options, stream);
    let appendResult = $$.omit(<PipeOptions>options, "pipes");
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
    result.status = $$.getKeyBool(<PipeOptions>options, "initialStatus");
    const response = $$.getKey(<PipeOptions>options, "response", []);
    if ($$.hasKeyFunc(<PipeOptions>options, "reducer")) {
        await helpers.addSubResults(
            <PipeOptions>options,
            stream,
            result,
            response
        );
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
    const conditionResult: PipeResult = await helpers.getSubResult(
        <PipeOptions>options,
        stream
    );
    const result: PipeResult = conditionResult.status
        ? await helpers.getSubResult(<PipeOptions>options, stream, 1)
        : await helpers.getSubResult(<PipeOptions>options, stream, 2);
    return result;
};

export const not: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    options = helpers.getFormattedOptions(options, stream, localStore);
    const result: PipeResult = await helpers.getSubResult(
        <PipeOptions>options,
        stream
    );
    result.status = !result.status;
    if ($$.hasKey(<PipeOptions>options, "response"))
        result.response = (<PipeOptions>options).response;
    else if (helpers.hasResponse(result)) result.response = result.response;
    return result;
};

export const or: ExtPipe = async (
    options,
    stream = {},
    localStore: PipeStore = globalStore
) => {
    (<PipeOptions>options).initialStatus = false;
    (<PipeOptions>options).reducer = (acc, curr) => acc || curr;
    (<PipeOptions>options).responseFilter = (result, subResult) =>
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
    if (
        stream.switchExp === (<PipeOptions>options).value ||
        stream.switchMatched
    ) {
        result = await helpers.getSubResult(<PipeOptions>options, stream);
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
    if (
        stream.switchExp === (<PipeOptions>options).value ||
        stream.switchMatched
    ) {
        result = await helpers.getSubResult(<PipeOptions>options, stream);
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
        result = await helpers.getSubResult(<PipeOptions>options, stream);
    }
    return result;
};

export const switchExp: ExtPipe = async (options, stream = {}) => {
    let result: PipeResult = {};
    if ($$.hasKey(<PipeOptions>options, "exp"))
        stream.switchExp = (<PipeOptions>options).exp;
    else if ($$.hasKey(<PipeOptions>options, "expression"))
        stream.switchExp = (<PipeOptions>options).expression;
    if ($$.hasKey(stream, "switchMatched")) stream.switchMatched = false;
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
    for (let pipe of $$.getKeyArr(<PipeOptions>options, "pipes")) {
        if ($$.getKey(result, "status", true)) result = await pipe(stream);
    }
    return result;
};
