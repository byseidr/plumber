export type ExtPipe = (
    options: PipeGeneral | PipeOptions,
    stream: { [key: string]: any },
    pipeList?: PipeList
) => Promise<PipeResult>;

export type Pipe = (stream: { [key: string]: any }) => Promise<PipeResult>;

export type PipeGeneral =
    | Pipe
    | ExtPipe
    | (Pipe | ExtPipe)[]
    | string
    | string[];

export type PipeList = { [key: string]: Pipe | ExtPipe };

export type PipeOptions = {
    exp?: any;
    expression?: any;
    pipe?: PipeGeneral;
    pipes?: PipeGeneral;
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
