export type BoundPipe = (stream: Stream) => PipeResult | Promise<PipeResult>;

export type Pipe = {
    bind: (this: any, thisArg: any, options: GenericOptions) => BoundPipe;
} & ((...args: PipeArgs) => PipeResult | Promise<PipeResult>);

export type PipeAlt = PipeToBeBound | string;

export type PipeArgs = [Stream] | [GenericOptions, Stream];

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
