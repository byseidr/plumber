export type BoundPipe = (stream: Stream) => PipeResult | Promise<PipeResult>;

export interface Pipe<T extends WithStream | WithOptionsAndStream> {
    (...args: T): PipeResult | Promise<PipeResult>;
    bind: (
        this: any,
        thisArg: any,
        options?: GenericOptions
    ) => Pipe<WithStream>;
}

export type PipeAlt = PipeToBeBound | string;

export type DynamicPipe = Pipe<WithStream | WithOptionsAndStream>;

export type PipeResult = {
    status?: boolean;
    response?: any;
};

export type PipeStore = { [key: string]: Pipe };

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

export type GenericStream = Stream | StreamResolver;

export type Options = {
    [key: string]: any;
};

export type OptionsAlt = Pipe | PipeAlt;

export type OptionsResolver = (stream: Stream) => Options | OptionsAlt;

export type Stream = { [key: string]: any };

export type StreamResolver = (options: Options) => Stream;

export type WithStream = [Stream?];

export type WithOptionsAndStream = [GenericOptions, Stream?];
