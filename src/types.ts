export type ExtPipe = (
    options: PipeOptions,
    stream: { [key: string]: any }
) => Promise<PipeResult>;

export type Pipe = (stream: { [key: string]: any }) => Promise<PipeResult>;

export type PipeOptions = {
    exp?: any;
    expression?: any;
    pipe?: Pipe | ExtPipe;
    pipes?: (Pipe | ExtPipe)[];
    initialStatus?: boolean;
    response?: string;
    reducer?: (acc: boolean, curr: boolean) => boolean;
    responseFilter?: PipeSubResultFilter;
    value?: any;
};

export type PipeResult = {
    status?: boolean;
    response?: string | string[];
};

export type PipeSubResultFilter = (
    result: PipeResult,
    subResult: PipeResult
) => boolean;
