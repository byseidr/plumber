import * as $$ from "richierich";

import {
    Fitting,
    FittingArgs,
    Options,
    FittingResult,
    FittingStore,
    FittingSubResultFilter,
    Stream,
    StreamResolver,
    GenericOptions,
    OptionsResolver,
    OptionsAlt,
    FittingAlt,
    FittingToBeBound,
    GenericStream,
} from "./types";

export const addOptionResponse = (options: Options, result: FittingResult) => {
    if (!$$.hasKey(options, "response") || $$.isEmpty(options.response)) return;
    result.response = $$.getFunc(options.response, result.status);
};

export const addStreamResult = (stream: Stream, result: FittingResult) => {
    if ($$.hasKey(result, "status")) stream.status = result.status;
    if ($$.hasKey(result, "response")) stream.response = result.response;
};

export const addSubResponse = (
    options: Options,
    result: FittingResult,
    subResult: FittingResult
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
    result: FittingResult
): Promise<void> => {
    const subResults: FittingResult[] = [];
    for (let fitting of $$.getKeyArr(options, "fittings")) {
        const subResult = await fitting(stream);
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
    result: FittingResult,
    subResult: FittingResult
): void => {
    result.status = options?.reducer
        ? options.reducer(getStatus(result), getStatus(subResult))
        : getStatus(subResult);
};

export const filterSubResult = (
    filter: FittingSubResultFilter | undefined,
    result: FittingResult,
    subResult: FittingResult
) => filter?.(result, subResult) ?? true;

export const getBoundFitting = (fitting: FittingToBeBound, stream: Stream) => {
    fitting[0] = getStoreFitting(fitting[0], stream);
    if ($$.isFunc(fitting?.[0]) && fitting?.[1])
        return fitting[0].bind(null, fitting[1]);
    return fitting[0];
};

export const getExp = async (
    options: Options,
    stream: Stream
): Promise<[FittingResult | any, number]> => {
    const optionResult = await getOptionExp(options, stream);
    let nextFitting = 0;
    if (optionResult) return [optionResult, nextFitting];
    const fittingResult: FittingResult = await getSubResult(options, stream);
    nextFitting++;
    return [fittingResult, nextFitting];
};

export const getExpOrResponse = async (
    options: Options,
    stream: Stream
): Promise<[any, number]> => {
    const [exp, nextFitting] = await getExp(options, stream);
    const response = exp?.response ?? exp;
    return [response, nextFitting];
};

export const getExpOrStatus = async (
    options: Options,
    stream: Stream
): Promise<[boolean, number]> => {
    const [exp, nextFitting] = await getExp(options, stream);
    const status = exp?.status ?? !!exp;
    return [status, nextFitting];
};

export const getFormattedArgs = (
    args: FittingArgs,
    defaultStore: FittingStore
) => {
    let options = args.length > 1 ? args[0] : {};
    let stream = <Stream>(args.length > 1 ? args[1] : args[0]);
    options = getFormattedOptions(options, stream);
    stream = getFormattedStream(options, stream, defaultStore);
    return { options, stream };
};

export const getFormattedFitting = (
    fitting: Fitting | FittingAlt,
    stream: Stream
) =>
    $$.isArr(fitting)
        ? <Fitting>getBoundFitting(<FittingToBeBound>fitting, stream)
        : getStoreFitting(<Fitting | string>fitting, stream);

export const getFormattedFittings = (options: Options, stream: Stream) => {
    if (options.fittings) {
        const fittings = $$.toArr(options.fittings);
        options = {
            ...options,
            fittings: fittings.map((fitting) =>
                getFormattedFitting(fitting, stream)
            ),
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
            fittings: <Exclude<OptionsAlt, OptionsResolver>>options,
        };
    options = getMergedFittings(<Options>options);
    options = getFormattedFittings(<Options>options, stream);
    return options;
};

export const getFormattedStream = (
    options: Options,
    stream: GenericStream,
    defaultStore: FittingStore
) => {
    if ($$.isFunc(stream)) stream = (<StreamResolver>stream)(options);
    if (!$$.hasKey(stream, "store"))
        (<Stream>stream).store = { ...defaultStore, ...(options?.store ?? {}) };
    return stream;
};

export const getMergedFittings = (options: Options) => {
    if (options.fitting) {
        const fitting = $$.toArr(options.fitting);
        const fittings = $$.toArr(options.fittings);
        options = {
            ...$$.omit(options, "fitting"),
            fittings: [...fitting, ...fittings].filter(Boolean),
        };
    }
    return options;
};

export const getOptionCases = (options: Options) => {
    const result: [any?, Fitting?] = [];
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
): Promise<FittingResult | any> => {
    const exp = options.exp ?? options.expression;
    return $$.isFunc(exp) ? await getSubResult(options, stream) : exp;
};

export const getStatus = (result: FittingResult) =>
    $$.hasKeyBool(result, "status") ? result.status : !!result.status;

export const getStoreFitting = (
    fitting: Fitting | string,
    stream: Stream
): Fitting =>
    $$.isStr(fitting) ? stream?.store?.[<string>fitting] ?? fitting : fitting;

export const getSubResult = async (
    options: Options,
    stream: Stream,
    index: number = 0,
    defaultVal: FittingResult = { status: false }
) => {
    const result = defaultVal;
    if (
        !$$.hasKey(options, "fittings") ||
        !$$.isFuncArr(options.fittings!) ||
        options.fittings!.length < index + 1
    )
        return result;
    const subResult = await options.fittings[index](stream);
    addSubStatus(options, result, subResult);
    addSubResponse(options, result, subResult);
    addOptionResponse(options, result);
    if (options.disableResultPropagation) return result;
    addStreamResult(stream, result);
    return result;
};

export const hasResponse = (result: FittingResult): boolean => {
    const hasResponse = $$.hasKey(result, "response");
    const isNotEmpty = !$$.isEmpty(result.response);
    return hasResponse && isNotEmpty;
};
