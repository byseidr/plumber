export type ExtFitting = (
    options: FittingGeneral | FittingOptions,
    stream: Stream,
    localStore?: FittingStore
) => FittingResult | Promise<FittingResult>;

export type Fitting = (
    stream: Stream
) => FittingResult | Promise<FittingResult>;

export type FittingGeneral =
    | Fitting
    | ExtFitting
    | (Fitting | ExtFitting)[]
    | string
    | string[]
    | string[][];

export type FittingOptions = {
    [key: string]: any;
};

export type FittingOptionsResolver = (
    stream: Stream
) => FittingGeneral | FittingOptions;

export type FittingResult = {
    status?: boolean;
    response?: any;
};

export type FittingStore = { [key: string]: Fitting | ExtFitting };

export type FittingSubResultFilter = (
    result: FittingResult,
    subResult: FittingResult
) => boolean;

export type Stream = { [key: string]: any };
