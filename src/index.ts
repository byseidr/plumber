import * as $$ from "richierich";

import * as helpers from "./helpers";

import { ExtPipe, Pipe, PipeResult } from "./types";

export const and: ExtPipe = async (options, stream = {}) => {
    options.initialStatus = true;
    options.reducer = (acc, curr) => acc && curr;
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
    const message = $$.getKey(options, "message", []);
    if ($$.hasKeyFunc(options, "reducer")) {
        await helpers.addSubResults(options, stream, result, message);
    }
    if (!$$.isEmpty(message)) result.message = message;
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
    if ($$.hasKey(options, "message")) result.message = options.message;
    else if (helpers.hasMessage(result)) result.message = result.message;
    return result;
};

export const or: ExtPipe = async (options, stream = {}) => {
    options.initialStatus = false;
    options.reducer = (acc, curr) => acc || curr;
    const result: PipeResult = await compare(options, stream);
    return result;
};

export const returnFalse: Pipe = async (stream = {}) => ({
    status: false,
});

export const returnTrue: Pipe = async (stream = {}) => ({
    status: true,
});

export const then: ExtPipe = async (options, stream = {}) => {
    let result: PipeResult = {};
    result.status = true;
    for (let pipe of $$.getKeyArr(options, "pipes")) {
        if ($$.getKey(result, "status", true)) result = await pipe(stream);
    }
    return result;
};
