import * as $$ from "richierich";

import {
    ExtPipe,
    Pipe,
    PipeGeneral,
    PipeOptions,
    PipeResult,
    PipeStore,
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
    pipeStore?: PipeStore
) => {
    if (!$$.isObj(options))
        options = {
            pipes: <PipeGeneral>options,
        };
    options = getMergedPipes(options);
    options = getFormattedPipes(options, pipeStore);
    return options;
};

export const getFormattedPipes = (
    options: PipeGeneral | PipeOptions,
    pipeStore?: PipeStore
) => {
    if ((<PipeOptions>options).pipes) {
        const pipes = $$.toArr((<PipeOptions>options).pipes);
        options = <PipeOptions>{
            ...(<PipeOptions>options),
            pipes: pipes.map((pipe) => getFormattedPipe(pipe, pipeStore)),
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
    pipe: Exclude<PipeGeneral, string[][]>,
    pipeStore?: PipeStore
) => {
    pipe = $$.toArr(pipe);
    if ($$.isStr(pipe[0])) pipe[0] = pipeStore?.[<string>pipe[0]] ?? pipe[0];
    if (pipe.length > 1) pipe = getPipeBounds(pipe);
    else pipe = pipe[0];
    return pipe;
};

export const getPipeBounds = (pipe: string[] | (Pipe | ExtPipe)[]) => {
    let boundPipe: Pipe | ExtPipe | null = null;
    if ($$.isFunc(pipe?.[0]))
        boundPipe = (<ExtPipe>pipe[0]).bind(null, pipe[1]);
    return boundPipe ?? pipe;
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
    defaultVal: PipeResult = { status: false }
) => {
    let result = defaultVal;
    if (
        $$.hasKey(options, "pipes") &&
        $$.isFuncArr(options.pipes!) &&
        options.pipes!.length >= index + 1
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
