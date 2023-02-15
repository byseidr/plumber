import * as $$ from "richierich";

import {
    ExtPipe,
    Pipe,
    PipeGeneral,
    PipeOptions,
    PipeOptionsResolver,
    PipeResult,
    PipeStore,
    PipeSubResultFilter,
    Stream,
} from "./types";

export const addOptionResponse = (options: PipeOptions, result: PipeResult) => {
    if (!$$.hasKey(options, "response") || $$.isEmpty(options.response)) return;
    result.response = $$.getFunc(options.response, result.status);
};

export const addStreamResult = (stream: Stream, result: PipeResult) => {
    if ($$.hasKey(result, "status")) stream.status = result.status;
    if ($$.hasKey(result, "response")) stream.response = result.response;
};

export const addSubResults = async (
    options: PipeOptions,
    stream: Stream,
    result: PipeResult,
    response: string[]
): Promise<void> => {
    const subResults: PipeResult[] = [];
    for (let pipe of $$.getKeyArr(options, "pipes")) {
        const subResult = await pipe(stream);
        addSubStatus(options, result, subResult);
        subResults.push(subResult);
        if (options.disableResultPropagation) continue;
        addStreamResult(stream, subResult);
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

export const getExp = async (
    options: PipeOptions,
    stream: Stream
): Promise<[PipeResult | any, number]> => {
    const optionResult = await getOptionExp(options, stream);
    let nextPipe = 0;
    if (optionResult) return [optionResult, nextPipe];
    const pipeResult: PipeResult = await getSubResult(options, stream);
    nextPipe++;
    return [pipeResult, nextPipe];
};

export const getExpOrResponse = async (
    options: PipeOptions,
    stream: Stream
): Promise<[any, number]> => {
    const [exp, nextPipe] = await getExp(options, stream);
    const response = exp?.response ?? exp;
    return [response, nextPipe];
};

export const getExpOrStatus = async (
    options: PipeOptions,
    stream: Stream
): Promise<[boolean, number]> => {
    const [exp, nextPipe] = await getExp(options, stream);
    const status = exp?.status ?? !!exp;
    return [status, nextPipe];
};

export const getFormattedOptions = (
    options: PipeGeneral | PipeOptions | PipeOptionsResolver,
    stream: Stream,
    pipeStore?: PipeStore
) => {
    if ($$.isFunc(options)) options = (<PipeOptionsResolver>options)(stream);
    if (!$$.isObj(options))
        options = {
            pipes: <PipeGeneral>options,
        };
    options = getMergedPipes(<PipeOptions>options);
    options = getFormattedPipes(<PipeOptions>options, pipeStore);
    return options;
};

export const getFormattedPipes = (
    options: PipeOptions,
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

export const getMergedPipes = (options: PipeOptions) => {
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

export const getOptionCases = (options: PipeOptions) => {
    const result: [any?, (Pipe | ExtPipe)?] = [];
    if (options?.cases) {
        result.push(...options.cases);
        return result;
    }
    if (!options?.case1) return result;
    $$.getSortedKeys(options).forEach((key) => {
        if (/case\d+/.test(key)) result.push(options[key]);
    });
    return result;
};

export const getOptionExp = async (
    options: PipeOptions,
    stream: Stream
): Promise<PipeResult | any> => {
    const exp = options.exp ?? options.expression;
    return $$.isFunc(exp) ? await getSubResult(options, stream) : exp;
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
    stream: Stream,
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
    if (options.disableResultPropagation) return result;
    addStreamResult(stream, result);
    return result;
};

export const hasResponse = (result: PipeResult): boolean => {
    const hasResponse = $$.hasKey(result, "response");
    const isNotEmpty = !$$.isEmpty(result.response);
    return hasResponse && isNotEmpty;
};
