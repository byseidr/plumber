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
import { Fitting, FittingResult } from "./types";

export const and: Fitting = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    options.initialStatus = true;
    options.reducer = (acc: boolean, curr: boolean) => acc && curr;
    options.responseFilter = (
        result: FittingResult,
        subResult: FittingResult
    ) => result?.status === subResult?.status;
    const result = await compare(options, stream);
    return result;
};

export const append: Fitting = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result = await getSubResult(options, stream);
    let appendResult = $$.omit(options, "fittings");
    result = { ...result, ...appendResult };
    return result;
};

export const compare: Fitting = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const result: FittingResult = {};
    result.status = $$.getKeyBool(options, "initialStatus");
    result.response = [];
    if ($$.hasKeyFunc(options, "reducer")) {
        await addSubResults(options, stream, result);
    }
    addOptionResponse(options, result);
    return result;
};

export const ifElse: Fitting = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const [condition, nextFitting]: [boolean, number] = await getExpOrStatus(
        options,
        stream
    );
    const result = condition
        ? await getSubResult(options, stream, nextFitting)
        : await getSubResult(options, stream, nextFitting + 1);
    return result;
};

export const not: Fitting = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const result = await getSubResult(options, stream);
    result.status = !result.status;
    return result;
};

export const or: Fitting = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    options.initialStatus = false;
    options.reducer = (acc: boolean, curr: boolean) => acc || curr;
    options.responseFilter = (
        result: FittingResult,
        subResult: FittingResult
    ) => result?.status === subResult?.status;
    const result: FittingResult = await compare(options, stream);
    return result;
};

export const returnFalse: Fitting = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result: FittingResult = {};
    result.status = false;
    addOptionResponse(options, result);
    return result;
};

export const returnTrue: Fitting = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result: FittingResult = {};
    result.status = true;
    addOptionResponse(options, result);
    return result;
};

export const setStore: Fitting = (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result: FittingResult = {};
    result.status = true;
    return result;
};

export const switchBlock: Fitting = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    const exp = await getExpOrResponse(options, stream);
    const cases = getOptionCases(options);
    const result: FittingResult = await then(
        {
            fittings: [
                switchExp.bind(null, { exp }),
                ...cases.map(([value, fitting]) =>
                    switchCaseBreak.bind(null, { value, fitting })
                ),
                switchDefault.bind(null, options.default),
            ],
        },
        stream
    );
    return result;
};

export const switchBreak: Fitting = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result: FittingResult = {};
    result.status = true;
    if ($$.hasKey(stream, "switchExp")) stream.switchExp = undefined;
    if ($$.hasKey(stream, "switchMatched")) stream.switchMatched = undefined;
    return result;
};

export const switchCase: Fitting = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result: FittingResult = {};
    result.status = true;
    if (stream.switchExp === options.value || stream.switchMatched) {
        result = await getSubResult(options, stream);
        stream.switchMatched = true;
    }
    return result;
};

export const switchCaseBreak: Fitting = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result: FittingResult = {};
    result.status = true;
    if (stream.switchExp === options.value || stream.switchMatched) {
        result = await getSubResult(options, stream);
        stream.switchMatched = true;
        await switchBreak(stream);
    }
    return result;
};

export const switchDefault: Fitting = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result: FittingResult = {};
    result.status = true;
    if ($$.hasKey(stream, "switchExp") && stream.switchMatched === false) {
        result = await getSubResult(options, stream);
        await switchBreak(stream);
    }
    return result;
};

export const switchExp: Fitting = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result: FittingResult = {};
    const [exp] = await getExpOrResponse(options, stream);
    if (exp) stream.switchExp = exp;
    stream.switchMatched = false;
    result.status = $$.hasKey(stream, "switchExp");
    return result;
};

export const then: Fitting = async (...args) => {
    const { options, stream } = getFormattedArgs(args, exports);
    let result: FittingResult = {};
    result.status = true;
    let i = 0;
    while ($$.getKeyArr(options, "fittings", false)) {
        if (!result.status) break;
        result = await getSubResult(options, stream, i);
        i++;
    }
    return result;
};
