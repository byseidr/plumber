import * as $$ from "richierich";

import {
    ExtPipe,
    Pipe,
    PipeGeneral,
    PipeList,
    PipeOptions,
    PipeResult,
    PipeSubResultFilter,
} from "./types";

export const addSubResults = async (
    options: PipeOptions,
    stream: { [key: string]: any },
    result: PipeResult,
    response: string[]
): Promise<void> => {
    const subResults: PipeResult[] = [];
    for (let pipe of $$.getKeyArr(options, "pipes")) {
        const subResult = await pipe(stream);
        addSubStatus(options, result, subResult);
        subResults.push(subResult);
    }
    for (let subResult of subResults) {
        addSubResponse(options, response, result, subResult);
    }
};

export const addSubResponse = (
    options: PipeOptions,
    response: string[],
    result: PipeResult,
    subResult: PipeResult
): void => {
    if (
        !$$.hasKey(options, "response") &&
        hasResponse(subResult) &&
        filterSubResult(options?.responseFilter, result, subResult)
    ) {
        response.push(...$$.toArr(subResult.response));
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

export const getFormattedOptions = (
    options: PipeGeneral | PipeOptions,
    pipeList?: PipeList
) => {
    if (!$$.isObj(options))
        options = {
            pipes: <PipeGeneral>options,
        };
    options = getMergedPipes(options);
    options = getFormattedPipes(options, pipeList);
    return options;
};

export const getFormattedPipes = (
    options: PipeGeneral | PipeOptions,
    pipeList?: PipeList
) => {
    if ((<PipeOptions>options).pipes) {
        const pipes = $$.toArr((<PipeOptions>options).pipes);
        options = {
            ...(<PipeOptions>options),
            pipes: pipes.map((pipe) => getFormattedPipe(pipe, pipeList)),
        };
    }
    return options;
};

export const getMergedPipes = (options: PipeGeneral | PipeOptions) => {
    if ((<PipeOptions>options).pipe) {
        const pipe = $$.toArr((<PipeOptions>options).pipe);
        const pipes = $$.toArr((<PipeOptions>options).pipes);
        options = {
            ...$$.omit(<PipeOptions>options, "pipe"),
            pipes: [...pipe, ...pipes].filter(Boolean),
        };
    }
    return options;
};

export const getFormattedPipe = (
    pipe: Pipe | ExtPipe | string,
    pipeList?: PipeList
) =>
    $$.isStr(pipe) && pipeList && pipeList[<string>pipe]
        ? pipeList[<string>pipe]
        : <Pipe | ExtPipe>pipe;

export const filterSubResult = (
    filter: PipeSubResultFilter | undefined,
    result: PipeResult,
    subResult: PipeResult
) => filter?.(result, subResult) ?? true;

export const getSubResult = async (
    options: PipeOptions,
    stream: { [key: string]: any },
    index: number = 0,
    defaultVal: PipeResult = { status: false }
) => {
    let result = defaultVal;
    if (
        $$.hasKey(options, "pipes") &&
        $$.isFuncArr(options.pipes!) &&
        options.pipes!.length === index + 1
    )
        result = await (<Pipe[]>options.pipes!)[index](stream);
    return result;
};

export const hasResponse = (result: PipeResult): boolean => {
    const hasResponse =
        $$.hasKeyStr(result, "response") || $$.hasKeyArr(result, "response");
    const isNotEmpty = !$$.isEmpty(result.response);
    return hasResponse && isNotEmpty;
};
