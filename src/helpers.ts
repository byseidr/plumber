import * as $$ from "richierich";

import { Guard, GuardOptions, GuardResult } from "./types";

export const addSubResults = async (
    options: GuardOptions,
    result: GuardResult,
    message: string[],
    data: any
): Promise<void> => {
    for (let guard of $$.getKeyArr(options, "guards")) {
        const subResult = await guard(data);
        addSubStatus(options, result, subResult);
        addSubMessage(options, message, subResult);
    }
};

export const addSubMessage = (
    options: GuardOptions,
    message: string[],
    subResult: GuardResult
): void => {
    if (!$$.hasKey(options, "message") && hasMessage(subResult)) {
        message.push(...$$.toArr(subResult.message));
    }
};

export const addSubStatus = (
    options: GuardOptions,
    result: GuardResult,
    subResult: GuardResult
): void => {
    result.status = options.reducer!(
        $$.getKeyBool(result, "status"),
        $$.getKeyBool(subResult, "status")
    );
};

export const getSubResult = async (
    options: GuardOptions,
    data: any,
    index: number = 0,
    defaultVal: GuardResult = { status: true }
) => {
    return $$.hasKey(options, "guards") &&
        $$.hasKey(options.guards!, <string>(<any>index))
        ? await (<Guard>options.guards![index])(data)
        : defaultVal;
};

export const hasMessage = (guardResult: GuardResult): boolean => {
    return (
        !$$.getKeyBool(guardResult, "status") &&
        ($$.hasKeyStr(guardResult, "message") ||
            $$.hasKeyArr(guardResult, "message")) &&
        !$$.isEmpty(guardResult.message)
    );
};
