import * as $$ from "richierich";

import * as helpers from "./helpers";

import { ExtGuard, Guard, GuardResult } from "./types";

export const and: ExtGuard = async (options, data, payload = {}) => {
    options.initialStatus = true;
    options.reducer = (acc, curr) => acc && curr;
    const result = await exports.compare(options, data, payload);
    return result;
};

export const append: ExtGuard = async (options, data, payload = {}) => {
    let result = await helpers.getSubResult(options, data, payload);
    let appendResult = $$.omit(options, "guards");
    result = { ...result, ...appendResult };
    return result;
};

export const compare: ExtGuard = async (options, data, payload = {}) => {
    const result: GuardResult = {};
    result.status = $$.getKeyBool(options, "initialStatus");
    const message = $$.getKey(options, "message", []);
    if ($$.hasKeyFunc(options, "reducer")) {
        await helpers.addSubResults(options, data, payload, result, message);
    }
    if (!$$.isEmpty(message)) result.message = message;
    return result;
};

export const ifElse: ExtGuard = async (options, data, payload = {}) => {
    const conditionResult: GuardResult = await helpers.getSubResult(
        options,
        data,
        payload
    );
    const result: GuardResult = conditionResult.status
        ? await helpers.getSubResult(options, data, payload, 1)
        : await helpers.getSubResult(options, data, payload, 2);
    return result;
};

export const not: ExtGuard = async (options, data, payload = {}) => {
    const result: GuardResult = await helpers.getSubResult(
        options,
        data,
        payload
    );
    result.status = !result.status;
    if ($$.hasKey(options, "message")) result.message = options.message;
    else if (helpers.hasMessage(result)) result.message = result.message;
    return result;
};

export const or: ExtGuard = async (options, data, payload = {}) => {
    options.initialStatus = false;
    options.reducer = (acc, curr) => acc || curr;
    const result: GuardResult = await exports.compare(options, data, payload);
    return result;
};

export const returnFalse: Guard = async (data, payload = {}) => ({
    status: false,
});

export const returnTrue: Guard = async (data, payload = {}) => ({
    status: true,
});

export const then: ExtGuard = async (options, data, payload = {}) => {
    let result: GuardResult = {};
    result.status = true;
    for (let guard of $$.getKeyArr(options, "guards")) {
        if ($$.getKey(result, "status", true))
            result = await guard(data, payload);
    }
    return result;
};
