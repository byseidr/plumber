import * as $$ from "richierich";

import { Pipe, PipeOptions, PipeResult, PipeSubResultFilter } from "./types";

export const addSubResults = async (
    options: PipeOptions,
    stream: { [key: string]: any },
    result: PipeResult,
    message: string[]
): Promise<void> => {
    const subResults: PipeResult[] = [];
    for (let pipe of $$.getKeyArr(options, "pipes")) {
        const subResult = await pipe(stream);
        addSubStatus(options, result, subResult);
        subResults.push(subResult);
    }
    for (let subResult of subResults) {
        addSubMessage(options, message, result, subResult);
    }
};

export const addSubMessage = (
    options: PipeOptions,
    message: string[],
    result: PipeResult,
    subResult: PipeResult
): void => {
    if (
        !$$.hasKey(options, "message") &&
        hasMessage(subResult) &&
        filterSubResult(options?.messageFilter, result, subResult)
    ) {
        message.push(...$$.toArr(subResult.message));
    }
};

export const addSubStatus = (
    options: PipeOptions,
    result: PipeResult,
    subResult: PipeResult
): void => {
    result.status = options.reducer!(
        $$.getKeyBool(result, "status"),
        $$.getKeyBool(subResult, "status")
    );
};

export const filterSubResult = (
    filter: PipeSubResultFilter | undefined,
    result: PipeResult,
    subResult: PipeResult
) => filter?.(result, subResult) ?? true;

export const getSubResult = async (
    options: PipeOptions,
    stream: { [key: string]: any },
    index: number = 0,
    defaultVal: PipeResult = { status: true }
) => {
    return $$.hasKey(options, "pipes") &&
        $$.hasKey(options.pipes!, <string>(<any>index))
        ? await (<Pipe>options.pipes![index])(stream)
        : defaultVal;
};

export const hasMessage = (pipeResult: PipeResult): boolean => {
    return (
        ($$.hasKeyStr(pipeResult, "message") ||
            $$.hasKeyArr(pipeResult, "message")) &&
        !$$.isEmpty(pipeResult.message)
    );
};
