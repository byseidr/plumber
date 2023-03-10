import * as $$ from "richierich";

import {
    addOptionResponse,
    addSubResults,
    getExpOrResponse,
    getExpOrStatus,
    getFormattedArgs,
    getOptionCases,
    getSubResult,
} from "./helpers";
import { Pipe, PipeResult } from "./types";

export const and: Pipe = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    options.initialStatus = true;
    options.reducer = (acc: boolean, curr: boolean) => acc && curr;
    options.responseFilter = (result: PipeResult, subResult: PipeResult) =>
        result?.status === subResult?.status;
    const result = await compare(options, stream);
    return result;
};

export const append: Pipe = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result = await getSubResult(options, stream);
    let appendResult = $$.omit(options, "pipes");
    result = { ...result, ...appendResult };
    return result;
};

export const compare: Pipe = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const result: PipeResult = {};
    result.status = $$.getKeyBool(options, "initialStatus");
    result.response = [];
    if ($$.hasKeyFunc(options, "reducer")) {
        await addSubResults(options, stream, result);
    }
    addOptionResponse(options, result);
    return result;
};

export const ifElse: Pipe = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const [condition, nextPipe]: [boolean, number] = await getExpOrStatus(
        options,
        stream
    );
    const result = condition
        ? await getSubResult(options, stream, nextPipe)
        : await getSubResult(options, stream, nextPipe + 1);
    return result;
};

export const not: Pipe = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const result = await getSubResult(options, stream);
    result.status = !result.status;
    return result;
};

export const or: Pipe = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    options.initialStatus = false;
    options.reducer = (acc: boolean, curr: boolean) => acc || curr;
    options.responseFilter = (result: PipeResult, subResult: PipeResult) =>
        result?.status === subResult?.status;
    const result: PipeResult = await compare(options, stream);
    return result;
};

export const returnFalse: Pipe = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result: PipeResult = {};
    result.status = false;
    addOptionResponse(options, result);
    return result;
};

export const returnTrue: Pipe = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result: PipeResult = {};
    result.status = true;
    addOptionResponse(options, result);
    return result;
};

export const setStore: Pipe = (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result: PipeResult = {};
    result.status = true;
    return result;
};

export const switchBlock: Pipe = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
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

export const switchBreak: Pipe = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result: PipeResult = {};
    result.status = true;
    if ($$.hasKey(stream, "switchExp")) stream.switchExp = undefined;
    if ($$.hasKey(stream, "switchMatched")) stream.switchMatched = undefined;
    return result;
};

export const switchCase: Pipe = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result: PipeResult = {};
    result.status = true;
    if (stream.switchExp === options.value || stream.switchMatched) {
        result = await getSubResult(options, stream);
        stream.switchMatched = true;
    }
    return result;
};

export const switchCaseBreak: Pipe = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result: PipeResult = {};
    result.status = true;
    if (stream.switchExp === options.value || stream.switchMatched) {
        result = await getSubResult(options, stream);
        stream.switchMatched = true;
        await switchBreak(stream);
    }
    return result;
};

export const switchDefault: Pipe = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result: PipeResult = {};
    result.status = true;
    if ($$.hasKey(stream, "switchExp") && stream.switchMatched === false) {
        result = await getSubResult(options, stream);
        await switchBreak(stream);
    }
    return result;
};

export const switchExp: Pipe = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result: PipeResult = {};
    const [exp] = await getExpOrResponse(options, stream);
    if (exp) stream.switchExp = exp;
    stream.switchMatched = false;
    result.status = $$.hasKey(stream, "switchExp");
    return result;
};

export const then: Pipe = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result: PipeResult = {};
    result.status = true;
    let i = 0;
    while ($$.getKeyArr(options, "pipes", false)) {
        if (!result.status) break;
        result = await getSubResult(options, stream, i);
        i++;
    }
    return result;
};