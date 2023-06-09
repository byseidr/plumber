import {
    getFunc,
    getKeyArr,
    getKeyBool,
    hasKey,
    hasKeyFunc,
    omit,
} from "richierich";

import {
    addOptionResponse,
    addSubResults,
    getExpOrResponse,
    getExpOrStatus,
    getFormattedArgs,
    getFormattedOptions,
    getOptionCases,
    getSubResult,
} from "./helpers";
import {
    DynamicPipe,
    Options,
    Pipe,
    PipeResult,
    WithOptionsAndStream,
    WithStream,
} from "./types";

export const and: Pipe<WithOptionsAndStream> = async (options, stream = {}) => {
    options = getFormattedOptions(options, stream);
    options.initialStatus = true;
    options.reducer = (acc: boolean, curr: boolean) => acc && curr;
    options.responseFilter = (result: PipeResult, subResult: PipeResult) =>
        result?.status === subResult?.status;
    const result = await compare(options, stream);
    return result;
};

export const append: Pipe<WithOptionsAndStream> = async (
    options,
    stream = {}
) => {
    options = getFormattedOptions(options, stream);
    let result = await getSubResult(options, stream);
    let appendResult = omit(options, "pipes");
    result = { ...result, ...appendResult };
    return result;
};

export const compare: Pipe<WithOptionsAndStream> = async (
    options,
    stream = {}
) => {
    options = getFormattedOptions(options, stream);
    const result: PipeResult = {};
    result.status = getKeyBool(options, "initialStatus");
    result.response = [];
    if (hasKeyFunc(options, "reducer")) {
        await addSubResults(options, stream, result);
    }
    addOptionResponse(options, result);
    return result;
};

export const ifElse: Pipe<WithOptionsAndStream> = async (
    options,
    stream = {}
) => {
    options = getFormattedOptions(options, stream);
    const [condition, nextPipe]: [boolean, number] = await getExpOrStatus(
        options,
        stream
    );
    const result = condition
        ? await getSubResult(options, stream, nextPipe)
        : await getSubResult(options, stream, nextPipe + 1);
    return result;
};

export const not: Pipe<WithOptionsAndStream> = async (options, stream = {}) => {
    options = getFormattedOptions(options, stream);
    const result = await getSubResult(options, stream);
    result.status = !result.status;
    return result;
};

export const or: Pipe<WithOptionsAndStream> = async (options, stream = {}) => {
    options = getFormattedOptions(options, stream);
    options.initialStatus = false;
    options.reducer = (acc: boolean, curr: boolean) => acc || curr;
    options.responseFilter = (result: PipeResult, subResult: PipeResult) =>
        result?.status === subResult?.status;
    const result: PipeResult = await compare(options, stream);
    return result;
};

export const returnFalse: DynamicPipe = async (...args) => {
    const { options } = getFormattedArgs(args);
    let result: PipeResult = {};
    result.status = false;
    addOptionResponse(options, result);
    return result;
};

export const returnTrue: DynamicPipe = async (...args) => {
    const { options } = getFormattedArgs(args);
    let result: PipeResult = {};
    result.status = true;
    addOptionResponse(options, result);
    return result;
};

export const switchBlock: Pipe<WithOptionsAndStream> = async (
    options,
    stream = {}
) => {
    options = getFormattedOptions(options, stream);
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

export const switchBreak: Pipe<WithStream> = async (stream = {}) => {
    let result: PipeResult = {};
    result.status = true;
    if (hasKey(stream, "switchExp")) stream.switchExp = undefined;
    if (hasKey(stream, "switchMatched")) stream.switchMatched = undefined;
    return result;
};

export const switchCase: Pipe<WithOptionsAndStream> = async (
    options,
    stream = {}
) => {
    options = getFormattedOptions(options, stream);
    let result: PipeResult = {};
    result.status = true;
    if (stream.switchExp === options.value || stream.switchMatched) {
        result = await getSubResult(options, stream);
        stream.switchMatched = true;
    }
    return result;
};

export const switchCaseBreak: Pipe<WithOptionsAndStream> = async (
    options,
    stream = {}
) => {
    options = getFormattedOptions(options, stream);
    let result: PipeResult = {};
    result.status = true;
    if (stream.switchExp === options.value || stream.switchMatched) {
        result = await getSubResult(options, stream);
        stream.switchMatched = true;
        await switchBreak(stream);
    }
    return result;
};

export const switchDefault: Pipe<WithOptionsAndStream> = async (
    options,
    stream = {}
) => {
    options = getFormattedOptions(options, stream);
    let result: PipeResult = {};
    result.status = true;
    if (hasKey(stream, "switchExp") && stream.switchMatched === false) {
        result = await getSubResult(options, stream);
        await switchBreak(stream);
    }
    return result;
};

export const switchExp: Pipe<WithOptionsAndStream> = async (
    options,
    stream = {}
) => {
    options = getFormattedOptions(options, stream);
    let result: PipeResult = {};
    const [exp] = await getExpOrResponse(options, stream);
    if (exp) stream.switchExp = exp;
    stream.switchMatched = false;
    result.status = hasKey(stream, "switchExp");
    return result;
};

export const then: Pipe<WithOptionsAndStream> = async (
    options,
    stream = {}
) => {
    options = getFormattedOptions(options, stream);
    let result: PipeResult = {};
    result.status = true;
    for (let i = 0; i < getKeyArr(options, "pipes").length; i++) {
        if (!result.status) break;
        result = await getSubResult(options, stream, i);
    }
    return result;
};

export const setDefaultOptions: Pipe<WithOptionsAndStream> = async (
    options,
    stream = {}
) => {
    options = getFormattedOptions(options, stream);
    let result: PipeResult = {};
    Object.keys(options).forEach((key) => {
        defaultOptions[key] = getFunc((<Options>options)[key], defaultOptions);
    });
    result.status = true;
    return result;
};

export const defaultOptions: Options = {
    pipeStore: { ...omit(exports, "defaultOptions") },
};
