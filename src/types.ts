export type ExtPipe = (
    options: PipeGeneral | PipeOptions,
    stream: { [key: string]: any },
    localStore?: PipeStore
) => Promise<PipeResult>;

export type Pipe = (stream: { [key: string]: any }) => Promise<PipeResult>;

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

export type PipeOptionsResolver = (stream: {
    [key: string]: any;
}) => PipeGeneral | PipeOptions;

export type PipeResult = {
    status?: boolean;
    response?: string | string[];
};

export type PipeStore = { [key: string]: Pipe | ExtPipe };

export type PipeSubResultFilter = (
    result: PipeResult,
    subResult: PipeResult
) => boolean;
