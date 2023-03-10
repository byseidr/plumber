export interface Pipe<T extends WithStream | WithOptionsAndStream> {
    (...args: T): PipeResult | Promise<PipeResult>;
    bind: (
        this: any,
        thisArg: any,
        options?: GenericOptions
    ) => Pipe<WithStream>;
}

export type BindablePipe = DynamicPipe | Pipe<WithOptionsAndStream>;

export type CallablePipe = DynamicPipe | Pipe<WithStream>;

export type DynamicPipe = Pipe<WithStream | WithOptionsAndStream>;

export type PipeResult = {
    status?: boolean;
    response?: any;
};

export type PipeStore = { [key: string]: GenericPipe };

export type PipeSubResultFilter = (
    result: PipeResult,
    subResult: PipeResult
) => boolean;

export type PipeToBeBound = [Pipe | string, GenericOptions];

export type GenericOptions =
    | Options
    | OptionsAlt
    | OptionsAlt[]
    | OptionsResolver;

export type GenericPipe =
    | DynamicPipe
    | Pipe<WithStream>
    | Pipe<WithOptionsAndStream>;

export type GenericStream = Stream | StreamResolver;

export type Options = {
    [key: string]: any;
};

export type OptionsAlt = Pipe | PipeToBeBound | string;

export type OptionsResolver = (stream: Stream) => Options | OptionsAlt;

export type Stream = { [key: string]: any };

export type StreamResolver = (options: Options) => Stream;

export type WithStream = [Stream?];

export type WithOptionsAndStream = [GenericOptions, Stream?];
