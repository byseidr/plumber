export interface OptionsBase {
    [key: `case${number}`]: [any, CallablePipe];
    cases?: [any, CallablePipe][];
    default?: CallablePipe;
    disableResultPropagation?: boolean;
    exp?: any;
    expression?: this["exp"];
    initialStatus?: boolean;
    locale?: string;
    pipe?: OptionsPipe | OptionsPipe[];
    pipes?: this["pipe"];
    reducer?: (acc: any, curr: any) => any;
    response?: any;
    responseFilter?: (result: PipeResult, subResult: PipeResult) => boolean;
    pipeStore?: PipeStore;
    value?: any;
    zone?: string;
}

export interface Pipe<T extends PipeArgs> {
    (...args: T): PipeResult | Promise<PipeResult>;
    bind: (
        this: any,
        thisArg: any,
        options?: GenericOptions
    ) => Pipe<WithStream>;
}

export interface StreamBase {
    data?: { [key: string]: any };
    response?: any;
    status?: boolean;
    store?: PipeStore;
    switchExp?: OptionsBase["exp"];
    switchMatched?: boolean;
}

export type BindablePipe = DynamicPipe | Pipe<WithOptionsAndStream>;

export type CallablePipe = DynamicPipe | Pipe<WithStream>;

export type DynamicPipe = Pipe<PipeArgs>;

export type GenericOptions =
    | Options
    | OptionsPipe
    | OptionsPipe[]
    | OptionsResolver;

export type GenericPipe =
    | DynamicPipe
    | Pipe<WithStream>
    | Pipe<WithOptionsAndStream>;

export type Options = { [K in keyof OptionsBase]?: OptionsBase[K] } & {
    [key: string]: any;
};

export type OptionsPipe = CallablePipe | PipeToBeBound | string;

export type OptionsResolver = (stream: Stream) => Options | OptionsPipe;

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

export type Response = any;

export type ResponseResolver = (status: Status) => Response;

export type Status = boolean;

export type Stream = { [K in keyof StreamBase]?: StreamBase[K] } & {
    [key: string]: any;
};

export type WithOptionsAndStream = [GenericOptions, Stream?];

export type WithStream = [Stream?];
