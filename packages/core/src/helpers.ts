import {
    getFunc,
    getKeyArr,
    getSortedKeys,
    hasKey,
    hasKeyBool,
    isArr,
    isEmpty,
    isFunc,
    isFuncArr,
    isObj,
    isStr,
    mergeKeyArr,
    mergeKeyObj,
    toArr,
} from "richierich";

import { defaultOptions } from ".";
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
    OptionsPipe,
    OptionsResolver,
    PipeToBeBound,
    GenericStream,
    WithOptionsAndStream,
    GenericPipe,
    BindablePipe,
    CallablePipe,
} from "./types";

export const addDefaultOptions = (options: Options) => {
    if (hasKey(options, "pipeStore"))
        options.pipeStore = {
            ...defaultOptions.pipeStore,
            ...options.pipeStore,
        };
    Object.keys(defaultOptions).forEach((key) => {
        if (!hasKey(options, key)) options[key] = defaultOptions[key];
    });
};

export const addFormattedPipes = (options: Options) => {
    if (!options.pipes) return;
    const pipes = toArr(options.pipes);
    options.pipes = <CallablePipe[]>(
        pipes.map((pipe) => getFormattedPipe(pipe, options)).filter(Boolean)
    );
};

export const addOptionResponse = (options: Options, result: PipeResult) => {
    if (!hasKey(options, "response") || isEmpty(options.response)) return;
    result.response = getFunc(options.response, result.status);
};

export const addStreamResult = (stream: Stream, result: PipeResult) => {
    if (hasKey(result, "status")) stream.status = result.status;
    if (hasKey(result, "response")) stream.response = result.response;
};

export const addSubResponse = (
    options: Options,
    result: PipeResult,
    subResult: PipeResult
): void => {
    if (
        !hasKey(options, "response") &&
        hasResponse(subResult) &&
        filterSubResult(options?.responseFilter, result, subResult)
    ) {
        (result.response ??= []).push(...toArr(subResult.response));
    }
};

export const addSubResults = async (
    options: Options,
    stream: Stream,
    result: PipeResult
): Promise<void> => {
    const subResults: PipeResult[] = [];
    for (let pipe of getKeyArr(options, "pipes")) {
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

export const getBoundPipe = (
    pipeTuple: PipeToBeBound,
    options: Options
): CallablePipe | string => {
    const pipe = <BindablePipe | string>getStorePipe(pipeTuple[0], options);
    if (isFunc(pipe) && pipeTuple?.[1])
        return getCallablePipe(<BindablePipe>pipe, pipeTuple[1]);
    return <string>pipe;
};

export const getCallablePipe = (
    pipe: BindablePipe,
    options: GenericOptions = {}
) => pipe.bind(null, options);

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

export const getFormattedArgs = (args: PipeArgs) => {
    let options = <GenericOptions>(args.length > 1 ? args[0] : {});
    let stream = <Stream>(args.length > 1 ? args[1] : args[0]);
    options = getFormattedOptions(options, stream);
    return { options, stream };
};

export const getFormattedPipe = (
    pipe: OptionsPipe,
    options: Options
): CallablePipe | undefined => {
    const formattedPipe = isArr(pipe)
        ? getBoundPipe(<PipeToBeBound>pipe, options)
        : getStorePipe(<CallablePipe | string>pipe, options);
    if (isStr(formattedPipe)) return;
    if (formattedPipe.length > 1)
        return getCallablePipe(<Pipe<WithOptionsAndStream>>formattedPipe);
    return <CallablePipe>formattedPipe;
};

export const getFormattedOptions = (
    options: GenericOptions,
    stream: Stream
) => {
    if (isFunc(options)) options = (<OptionsResolver>options)(stream);
    if (!isObj(options))
        options = { pipes: <OptionsPipe | OptionsPipe[]>options };
    mergeOptionAliases(<Options>options);
    addFormattedPipes(<Options>options);
    addDefaultOptions(<Options>options);
    return <Options>options;
};

export const getOptionCases = (options: Options) => {
    const result: [any?, GenericPipe?] = [];
    if (options?.cases) {
        result.push(...options.cases);
        return result;
    }
    if (!options?.case1) return result;
    getSortedKeys(options).forEach((key) => {
        if (/case\d+/.test(key)) result.push(options[key]);
    });
    return result;
};

export const getOptionExp = async (
    options: Options,
    stream: Stream
): Promise<PipeResult | any> => {
    const exp = options.exp ?? options.expression;
    return isFunc(exp) ? await getSubResult(options, stream) : exp;
};

export const getStatus = (result: PipeResult) =>
    hasKeyBool(result, "status") ? result.status : !!result.status;

export const getStorePipe = (
    pipe: GenericPipe | string,
    options: Options
): GenericPipe | string =>
    isStr(pipe) ? options?.pipeStore?.[<string>pipe] ?? pipe : pipe;

export const getSubResult = async (
    options: Options,
    stream: Stream,
    index: number = 0,
    defaultVal: PipeResult = { status: false }
) => {
    const result = defaultVal;
    if (
        !hasKey(options, "pipes") ||
        !isFuncArr(options.pipes!) ||
        options.pipes!.length < index + 1
    )
        return result;
    const subResult = await (<CallablePipe[]>options.pipes)[index](stream);
    addSubStatus(options, result, subResult);
    addSubResponse(options, result, subResult);
    addOptionResponse(options, result);
    if (options.disableResultPropagation) return result;
    addStreamResult(stream, result);
    return result;
};

export const mergeOptionAliases = (options: Options) => {
    mergeKeyArr(<Options>options, "pipes", "pipe");
    mergeKeyObj(<Options>options, "pipeStore", ["store", "Store", "pipestore"]);
};

export const hasResponse = (result: PipeResult): boolean => {
    const hasResponse = hasKey(result, "response");
    const isNotEmpty = !isEmpty(result.response);
    return hasResponse && isNotEmpty;
};
