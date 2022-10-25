export type ErrorCodes = 'user-abort' | 'h5p-not-found';

export default class LumiError extends Error {
    constructor(
        code: ErrorCodes,
        message?: string,
        status: number = 500,
        error?: Error
    ) {
        super(message);
        this.code = code;
        this.message = message;
        this.status = status;
        this.error = new Error(message);
    }

    public code: ErrorCodes;
    public error: Error;
    public message: string;
    public status: number;
}
