import * as $$ from "richierich";

import {
    addOptionResponse,
    addSubResults,
    getExpOrResponse,
    getExpOrStatus,
    getFormattedOptions,
    getOptionCases,
    getSubResult,
} from "./helpers";
import { ExtFitting, Fitting, FittingResult, FittingStore } from "./types";

var globalStore: FittingStore;

export const and: ExtFitting = async (
    options,
    stream = {},
    localStore: FittingStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    options.initialStatus = true;
    options.reducer = (acc: boolean, curr: boolean) => acc && curr;
    options.responseFilter = (
        result: FittingResult,
        subResult: FittingResult
    ) => result?.status === subResult?.status;
    const result = await compare(options, stream, localStore);
    return result;
};

export const append: ExtFitting = async (
    options,
    stream = {},
    localStore: FittingStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    let result = await getSubResult(options, stream);
    let appendResult = $$.omit(options, "fittings");
    result = { ...result, ...appendResult };
    return result;
};

export const compare: ExtFitting = async (
    options,
    stream = {},
    localStore: FittingStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    const result: FittingResult = {};
    result.status = $$.getKeyBool(options, "initialStatus");
    result.response = [];
    if ($$.hasKeyFunc(options, "reducer")) {
        await addSubResults(options, stream, result);
    }
    addOptionResponse(options, result);
    return result;
};

export const ifElse: ExtFitting = async (
    options,
    stream = {},
    localStore: FittingStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    const [condition, nextFitting]: [boolean, number] = await getExpOrStatus(
        options,
        stream
    );
    const result = condition
        ? await getSubResult(options, stream, nextFitting)
        : await getSubResult(options, stream, nextFitting + 1);
    return result;
};

export const not: ExtFitting = async (
    options,
    stream = {},
    localStore: FittingStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    const result = await getSubResult(options, stream);
    result.status = !result.status;
    return result;
};

export const or: ExtFitting = async (
    options,
    stream = {},
    localStore: FittingStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    options.initialStatus = false;
    options.reducer = (acc: boolean, curr: boolean) => acc || curr;
    options.responseFilter = (
        result: FittingResult,
        subResult: FittingResult
    ) => result?.status === subResult?.status;
    const result: FittingResult = await compare(options, stream, localStore);
    return result;
};

export const returnFalse: Fitting = async (stream = {}) => ({
    status: false,
});

export const returnTrue: Fitting = async (stream = {}) => ({
    status: true,
});

export const setStore = (store?: FittingStore) => {
    globalStore = store ? { ...exports, ...store } : { ...exports };
};

export const switchBlock: ExtFitting = async (
    options,
    stream = {},
    localStore: FittingStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
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

export const switchBreak: Fitting = async (stream = {}) => {
    let result: FittingResult = {};
    result.status = true;
    if ($$.hasKey(stream, "switchExp")) stream.switchExp = undefined;
    if ($$.hasKey(stream, "switchMatched")) stream.switchMatched = undefined;
    return result;
};

export const switchCase: ExtFitting = async (
    options,
    stream = {},
    localStore: FittingStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    let result: FittingResult = {};
    result.status = true;
    if (stream.switchExp === options.value || stream.switchMatched) {
        result = await getSubResult(options, stream);
        stream.switchMatched = true;
    }
    return result;
};

export const switchCaseBreak: ExtFitting = async (
    options,
    stream = {},
    localStore: FittingStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    let result: FittingResult = {};
    result.status = true;
    if (stream.switchExp === options.value || stream.switchMatched) {
        result = await getSubResult(options, stream);
        stream.switchMatched = true;
        await switchBreak(stream);
    }
    return result;
};

export const switchDefault: ExtFitting = async (
    options,
    stream = {},
    localStore: FittingStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    let result: FittingResult = {};
    result.status = true;
    if ($$.hasKey(stream, "switchExp") && stream.switchMatched === false) {
        result = await getSubResult(options, stream);
        await switchBreak(stream);
    }
    return result;
};

export const switchExp: ExtFitting = async (
    options,
    stream = {},
    localStore: FittingStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
    let result: FittingResult = {};
    const [exp] = await getExpOrResponse(options, stream);
    if (exp) stream.switchExp = exp;
    stream.switchMatched = false;
    result.status = $$.hasKey(stream, "switchExp");
    return result;
};

export const then: ExtFitting = async (
    options,
    stream = {},
    localStore: FittingStore = globalStore
) => {
    options = getFormattedOptions(options, stream, localStore);
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
