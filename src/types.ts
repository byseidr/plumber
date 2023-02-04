export type ExtPipe = (
    options: PipeGeneral | PipeOptions,
    stream: Stream,
    localStore?: PipeStore
) => PipeResult | Promise<PipeResult>;

export type Pipe = (stream: Stream) => PipeResult | Promise<PipeResult>;

export type PipeGeneral =
    | Pipe
    | ExtPipe
    | (Pipe | ExtPipe)[]
    | string
    | string[]
    | string[][];

export type PipeOptions = {
    [key: string]: any;
};

export type PipeOptionsResolver = (stream: Stream) => PipeGeneral | PipeOptions;

export type PipeResult = {
    status?: boolean;
    response?: any;
};

export type PipeStore = { [key: string]: Pipe | ExtPipe };

export type PipeSubResultFilter = (
    result: PipeResult,
    subResult: PipeResult
) => boolean;

export type Stream = { [key: string]: any };
