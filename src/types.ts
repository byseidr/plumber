export type ExtGuard = (
    options: GuardOptions,
    data: any,
    payload: { [key: string]: any }
) => Promise<GuardResult>;

export type Guard = (
    data: any,
    payload: { [key: string]: any }
) => Promise<GuardResult>;

export type GuardOptions = {
    guards?: (Guard | ExtGuard)[];
    initialStatus?: boolean;
    message?: string;
    reducer?: (acc: boolean, curr: boolean) => boolean;
};

export type GuardResult = {
    status?: boolean;
    message?: string | string[];
};
