import * as $$ from "richierich";

import * as helpers from "./helpers";

import { ExtPipe, Pipe, PipeResult } from "./types";

export const and: ExtPipe = async (options, stream = {}) => {
    options.initialStatus = true;
    options.reducer = (acc, curr) => acc && curr;
    options.responseFilter = (result, subResult) =>
        result?.status === subResult?.status;
    const result = await compare(options, stream);
    return result;
};

export const append: ExtPipe = async (options, stream = {}) => {
    let result = await helpers.getSubResult(options, stream);
    let appendResult = $$.omit(options, "pipes");
    result = { ...result, ...appendResult };
    return result;
};

export const compare: ExtPipe = async (options, stream = {}) => {
    const result: PipeResult = {};
    result.status = $$.getKeyBool(options, "initialStatus");
    const response = $$.getKey(options, "response", []);
    if ($$.hasKeyFunc(options, "reducer")) {
        await helpers.addSubResults(options, stream, result, response);
    }
    if (!$$.isEmpty(response)) result.response = response;
    return result;
};

export const ifElse: ExtPipe = async (options, stream = {}) => {
    const conditionResult: PipeResult = await helpers.getSubResult(
        options,
        stream
    );
    const result: PipeResult = conditionResult.status
        ? await helpers.getSubResult(options, stream, 1)
        : await helpers.getSubResult(options, stream, 2);
    return result;
};

export const not: ExtPipe = async (options, stream = {}) => {
    const result: PipeResult = await helpers.getSubResult(options, stream);
    result.status = !result.status;
    if ($$.hasKey(options, "response")) result.response = options.response;
    else if (helpers.hasResponse(result)) result.response = result.response;
    return result;
};

export const or: ExtPipe = async (options, stream = {}) => {
    options.initialStatus = false;
    options.reducer = (acc, curr) => acc || curr;
    options.responseFilter = (result, subResult) =>
        result?.status === subResult?.status;
    const result: PipeResult = await compare(options, stream);
    return result;
};

export const returnFalse: Pipe = async (stream = {}) => ({
    status: false,
});

export const returnTrue: Pipe = async (stream = {}) => ({
    status: true,
});

export const switchBreak: Pipe = async (stream = {}) => {
    let result: PipeResult = {};
    result.status = true;
    if (stream.switchExp && stream.switchMatched) {
        stream.switchExp = undefined;
        stream.switchMatched = undefined;
    }
    return result;
};

export const switchCase: ExtPipe = async (options, stream = {}) => {
    let result: PipeResult = {};
    result.status = true;
    if (stream.switchExp === options.value || stream.switchMatched) {
        result = await helpers.getSubResult(options, stream);
        stream.switchMatched = true;
    }
    return result;
};

export const switchDefault: ExtPipe = async (options, stream = {}) => {
    let result: PipeResult = {};
    result.status = true;
    if (stream.switchExp && !stream.switchMatched) {
        result = await helpers.getSubResult(options, stream);
    }
    return result;
};

export const switchExp: ExtPipe = async (options, stream = {}) => {
    let result: PipeResult = {};
    stream.switchExp = options.exp || options.expression;
    result.status = !!stream.switchExp;
    return result;
};

export const then: ExtPipe = async (options, stream = {}) => {
    let result: PipeResult = {};
    result.status = true;
    for (let pipe of $$.getKeyArr(options, "pipes")) {
        if ($$.getKey(result, "status", true)) result = await pipe(stream);
    }
    return result;
};
