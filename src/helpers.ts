import * as $$ from "richierich";

import {
    ExtFitting,
    Fitting,
    FittingGeneral,
    FittingOptions,
    FittingOptionsResolver,
    FittingResult,
    FittingSubResultFilter,
    Stream,
} from "./types";

export const addOptionResponse = (
    options: FittingOptions,
    result: FittingResult
) => {
    if (!$$.hasKey(options, "response") || $$.isEmpty(options.response)) return;
    result.response = $$.getFunc(options.response, result.status);
};

export const addStreamResult = (stream: Stream, result: FittingResult) => {
    if ($$.hasKey(result, "status")) stream.status = result.status;
    if ($$.hasKey(result, "response")) stream.response = result.response;
};

export const addSubResults = async (
    options: FittingOptions,
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

export const addSubResponse = (
    options: FittingOptions,
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

export const addSubStatus = (
    options: FittingOptions,
    result: FittingResult,
    subResult: FittingResult
): void => {
    result.status = options?.reducer
        ? options.reducer(getStatus(result), getStatus(subResult))
        : getStatus(subResult);
};

export const getExp = async (
    options: FittingOptions,
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
    options: FittingOptions,
    stream: Stream
): Promise<[any, number]> => {
    const [exp, nextFitting] = await getExp(options, stream);
    const response = exp?.response ?? exp;
    return [response, nextFitting];
};

export const getExpOrStatus = async (
    options: FittingOptions,
    stream: Stream
): Promise<[boolean, number]> => {
    const [exp, nextFitting] = await getExp(options, stream);
    const status = exp?.status ?? !!exp;
    return [status, nextFitting];
};

export const getFormattedOptions = (
    options: FittingGeneral | FittingOptions | FittingOptionsResolver,
    stream: Stream
) => {
    if ($$.isFunc(options)) options = (<FittingOptionsResolver>options)(stream);
    if (!$$.isObj(options))
        options = {
            fittings: <FittingGeneral>options,
        };
    options = getMergedFittings(<FittingOptions>options);
    options = getFormattedFittings(<FittingOptions>options, stream);
    return options;
};

export const getFormattedFittings = (
    options: FittingOptions,
    stream: Stream
) => {
    if ((<FittingOptions>options).fittings) {
        const fittings = $$.toArr((<FittingOptions>options).fittings);
        options = <FittingOptions>{
            ...(<FittingOptions>options),
            fittings: fittings.map((fitting) =>
                getFormattedFitting(fitting, stream)
            ),
        };
    }
    return options;
};

export const getMergedFittings = (options: FittingOptions) => {
    if ((<FittingOptions>options).fitting) {
        const fitting = $$.toArr((<FittingOptions>options).fitting);
        const fittings = $$.toArr((<FittingOptions>options).fittings);
        options = {
            ...$$.omit(<FittingOptions>options, "fitting"),
            fittings: [...fitting, ...fittings].filter(Boolean),
        };
    }
    return options;
};

export const getOptionCases = (options: FittingOptions) => {
    const result: [any?, (Fitting | ExtFitting)?] = [];
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
    options: FittingOptions,
    stream: Stream
): Promise<FittingResult | any> => {
    const exp = options.exp ?? options.expression;
    return $$.isFunc(exp) ? await getSubResult(options, stream) : exp;
};

export const getFormattedFitting = (
    fitting: Exclude<FittingGeneral, string[][]>,
    stream: Stream
) => {
    fitting = $$.toArr(fitting);
    if ($$.isStr(fitting[0]))
        fitting[0] = stream?.store?.[<string>fitting[0]] ?? fitting[0];
    if (fitting.length > 1) fitting = getFittingBounds(fitting);
    else fitting = fitting[0];
    return fitting;
};

export const getFittingBounds = (
    fitting: string[] | (Fitting | ExtFitting)[]
) => {
    let boundFitting: Fitting | ExtFitting | null = null;
    if ($$.isFunc(fitting?.[0]))
        boundFitting = (<ExtFitting>fitting[0]).bind(null, fitting[1]);
    return boundFitting ?? fitting;
};

export const filterSubResult = (
    filter: FittingSubResultFilter | undefined,
    result: FittingResult,
    subResult: FittingResult
) => filter?.(result, subResult) ?? true;

export const getSubResult = async (
    options: FittingOptions,
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
    const subResult = await (<Fitting[]>options.fittings!)[index](stream);
    addSubStatus(options, result, subResult);
    addSubResponse(options, result, subResult);
    addOptionResponse(options, result);
    if (options.disableResultPropagation) return result;
    addStreamResult(stream, result);
    return result;
};

export const getStatus = (result: FittingResult) =>
    $$.hasKeyBool(result, "status") ? result.status : !!result.status;

export const hasResponse = (result: FittingResult): boolean => {
    const hasResponse = $$.hasKey(result, "response");
    const isNotEmpty = !$$.isEmpty(result.response);
    return hasResponse && isNotEmpty;
};
