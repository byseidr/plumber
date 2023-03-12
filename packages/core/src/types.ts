export interface OptionsBase {
    [key: `case${number}`]: [any, CallablePipe];
    cases?: [any, CallablePipe][];
    default?: CallablePipe;
    disableResultPropagation?: boolean;
    exp?: any;
    expression?: this["exp"];
    initialStatus?: boolean;
    pipe?: OptionsPipe | OptionsPipe[];
    pipes?: this["pipe"];
    reducer?: (acc: any, curr: any) => any;
    response?: any;
    responseFilter?: (result: PipeResult, subResult: PipeResult) => boolean;
    store?: PipeStore;
    value?: any;
}

export interface StreamBase {
    data?: { [key: string]: any };
    response?: any;
    status?: boolean;
    store?: PipeStore;
    switchExp?: OptionsBase["exp"];
    switchMatched?: boolean;
}

export interface Pipe<T extends PipeArgs> {
    (...args: T): PipeResult | Promise<PipeResult>;
    bind: (
        this: any,
        thisArg: any,
        options?: GenericOptions
    ) => Pipe<WithStream>;
}

export type BindablePipe = DynamicPipe | Pipe<WithOptionsAndStream>;

export type CallablePipe = DynamicPipe | Pipe<WithStream>;

export type DynamicPipe = Pipe<PipeArgs>;

export type PipeArgs = WithStream | WithOptionsAndStream;

export type PipeResult = {
    status?: boolean;
    response?: any;
};

export type PipeStore = { [key: string]: GenericPipe };

export type PipeSubResultFilter = (
    result: PipeResult,
    subResult: PipeResult
) => boolean;

export type PipeToBeBound = [BindablePipe | string, Options];

export type GenericOptions =
    | Options
    | OptionsPipe
    | OptionsPipe[]
    | OptionsResolver;

export type GenericPipe =
    | DynamicPipe
    | Pipe<WithStream>
    | Pipe<WithOptionsAndStream>;

export type GenericStream = Stream | StreamResolver;

export type Options = {
    [pipe in "pipe" | "pipes"]?: OptionsPipe | OptionsPipe[];
} & {
    [key: string]: any;
};

export type OptionsPipe = CallablePipe | PipeToBeBound | string;

export type OptionsResolver = (stream: Stream) => Options | OptionsPipe;

export type Stream = { [key: string]: any };

export type StreamResolver = (options: Options) => Stream;

export type WithStream = [Stream?];

export type WithOptionsAndStream = [GenericOptions, Stream?];
