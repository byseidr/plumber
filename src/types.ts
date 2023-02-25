export type BoundFitting = (
    stream: Stream
) => FittingResult | Promise<FittingResult>;

export type Fitting = {
    bind: (this: any, thisArg: any, options: GenericOptions) => BoundFitting;
} & ((...args: FittingArgs) => FittingResult | Promise<FittingResult>);

export type FittingAlt = FittingToBeBound | string;

export type FittingArgs = [Stream] | [GenericOptions, Stream];

export type FittingResult = {
    status?: boolean;
    response?: any;
};

export type FittingStore = { [key: string]: Fitting };

export type FittingSubResultFilter = (
    result: FittingResult,
    subResult: FittingResult
) => boolean;

export type FittingToBeBound = [Fitting | string, GenericOptions];

export type GenericOptions =
    | Options
    | OptionsAlt
    | OptionsAlt[]
    | OptionsResolver;

export type GenericStream = Stream | StreamResolver;

export type Options = {
    [key: string]: any;
};

export type OptionsAlt = Fitting | FittingAlt;

export type OptionsResolver = (stream: Stream) => Options | OptionsAlt;

export type Stream = { [key: string]: any };

export type StreamResolver = (options: Options) => Stream;
