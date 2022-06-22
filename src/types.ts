export type ExtPipe = (
    options: PipeOptions,
    stream: { [key: string]: any }
) => Promise<PipeResult>;

export type Pipe = (stream: { [key: string]: any }) => Promise<PipeResult>;

export type PipeOptions = {
    pipes?: (Pipe | ExtPipe)[];
    initialStatus?: boolean;
    message?: string;
    reducer?: (acc: boolean, curr: boolean) => boolean;
    messageFilter?: (result: PipeResult, subResult: PipeResult) => boolean;
};

export type PipeResult = {
    status?: boolean;
    message?: string | string[];
};

export type PipeSubResultFilter = (
    result: PipeResult,
    subResult: PipeResult
) => boolean;
