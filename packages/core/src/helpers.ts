import * as $$ from "richierich";

import {
    Pipe,
    PipeArgs,
    Options,
    PipeResult,
    PipeStore,
    PipeSubResultFilter,
    Stream,
    StreamResolver,
    GenericOptions,
    OptionsResolver,
    OptionsAlt,
    PipeAlt,
    PipeToBeBound,
    GenericStream,
    GenericPipe,
} from "./types";

export const addOptionResponse = (options: Options, result: PipeResult) => {
    if (!$$.hasKey(options, "response") || $$.isEmpty(options.response)) return;
    result.response = $$.getFunc(options.response, result.status);
};

export const addStreamResult = (stream: Stream, result: PipeResult) => {
    if ($$.hasKey(result, "status")) stream.status = result.status;
    if ($$.hasKey(result, "response")) stream.response = result.response;
};

export const addSubResponse = (
    options: Options,
    result: PipeResult,
    subResult: PipeResult
): void => {
    if (
        !$$.hasKey(options, "response") &&
        hasResponse(subResult) &&
        filterSubResult(options?.responseFilter, result, subResult)
    ) {
        (result.response ??= []).push(...$$.toArr(subResult.response));
    }
};

export const addSubResults = async (
    options: Options,
    stream: Stream,
    result: PipeResult
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
        addSubResponse(options, result, subResult);
    }
};

export const addSubStatus = (
    options: Options,
    result: PipeResult,
    subResult: PipeResult
): void => {
    result.status = options?.reducer
        ? options.reducer(getStatus(result), getStatus(subResult))
        : getStatus(subResult);
};

export const filterSubResult = (
    filter: PipeSubResultFilter | undefined,
    result: PipeResult,
    subResult: PipeResult
) => filter?.(result, subResult) ?? true;

export const getBoundPipe = (pipe: PipeToBeBound, stream: Stream) => {
    pipe[0] = getStorePipe(pipe[0], stream);
    if ($$.isFunc(pipe?.[0]) && pipe?.[1]) return pipe[0].bind(null, pipe[1]);
    return pipe[0];
};

export const getExp = async (
    options: Options,
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
    options: Options,
    stream: Stream
): Promise<[any, number]> => {
    const [exp, nextPipe] = await getExp(options, stream);
    const response = exp?.response ?? exp;
    return [response, nextPipe];
};

export const getExpOrStatus = async (
    options: Options,
    stream: Stream
): Promise<[boolean, number]> => {
    const [exp, nextPipe] = await getExp(options, stream);
    const status = exp?.status ?? !!exp;
    return [status, nextPipe];
};

export const getFormattedArgs = (args: PipeArgs, defaultStore: PipeStore) => {
    let options = args.length > 1 ? args[0] : {};
    let stream = <Stream>(args.length > 1 ? args[1] : args[0]);
    options = getFormattedOptions(options, stream);
    stream = getFormattedStream(options, stream, defaultStore);
    return { options, stream };
};

export const getFormattedPipe = (pipe: Pipe | PipeAlt, stream: Stream) =>
    $$.isArr(pipe)
        ? <Pipe>getBoundPipe(<PipeToBeBound>pipe, stream)
        : getStorePipe(<Pipe | string>pipe, stream);

export const getFormattedPipes = (options: Options, stream: Stream) => {
    if (options.pipes) {
        const pipes = $$.toArr(options.pipes);
        options = {
            ...options,
            pipes: pipes.map((pipe) => getFormattedPipe(pipe, stream)),
        };
    }
    return options;
};

export const getFormattedOptions = (
    options: GenericOptions,
    stream: Stream
) => {
    if ($$.isFunc(options)) options = (<OptionsResolver>options)(stream);
    if (!$$.isObj(options))
        options = {
            pipes: <Exclude<OptionsAlt, OptionsResolver>>options,
        };
    options = getMergedPipes(<Options>options);
    options = getFormattedPipes(<Options>options, stream);
    return options;
};

export const getFormattedStream = (
    options: Options,
    stream: GenericStream,
    defaultStore: PipeStore
) => {
    if ($$.isFunc(stream)) stream = (<StreamResolver>stream)(options);
    if (!$$.hasKey(stream, "store"))
        (<Stream>stream).store = { ...defaultStore, ...(options?.store ?? {}) };
    return stream;
};

export const getMergedPipes = (options: Options) => {
    if (options.pipe) {
        const pipe = $$.toArr(options.pipe);
        const pipes = $$.toArr(options.pipes);
        options = {
            ...$$.omit(options, "pipe"),
            pipes: [...pipe, ...pipes].filter(Boolean),
        };
    }
    return options;
};

export const getOptionCases = (options: Options) => {
    const result: [any?, GenericPipe?] = [];
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
    options: Options,
    stream: Stream
): Promise<PipeResult | any> => {
    const exp = options.exp ?? options.expression;
    return $$.isFunc(exp) ? await getSubResult(options, stream) : exp;
};

export const getStatus = (result: PipeResult) =>
    $$.hasKeyBool(result, "status") ? result.status : !!result.status;

export const getStorePipe = (
    pipe: GenericPipe | string,
    stream: Stream
): GenericPipe =>
    $$.isStr(pipe) ? stream?.store?.[<string>pipe] ?? pipe : pipe;

export const getSubResult = async (
    options: Options,
    stream: Stream,
    index: number = 0,
    defaultVal: PipeResult = { status: false }
) => {
    const result = defaultVal;
    if (
        !$$.hasKey(options, "pipes") ||
        !$$.isFuncArr(options.pipes!) ||
        options.pipes!.length < index + 1
    )
        return result;
    const subResult = await options.pipes[index](stream);
    addSubStatus(options, result, subResult);
    addSubResponse(options, result, subResult);
    addOptionResponse(options, result);
    if (options.disableResultPropagation) return result;
    addStreamResult(stream, result);
    return result;
};

export const hasResponse = (result: PipeResult): boolean => {
    const hasResponse = $$.hasKey(result, "response");
    const isNotEmpty = !$$.isEmpty(result.response);
    return hasResponse && isNotEmpty;
};
