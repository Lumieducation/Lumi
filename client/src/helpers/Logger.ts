import debug from 'debug';

enum logLevelNumber {
    error,
    warn,
    info,
    verbose,
    debug,
    silly
}

export type logLevel =
    | 'error'
    | 'warn'
    | 'info'
    | 'verbose'
    | 'debug'
    | 'silly';

export default class Logger {
    constructor(private scope: string) {
        this.DEBUG =
            this.ERROR =
            this.INFO =
            this.SILLY =
            this.VERBOSE =
            this.WARN =
                debug(`lumi:${this.scope}`);

        this.logLevel = 'info';
    }

    private DEBUG: (...args: any[]) => any;
    private ERROR: (...args: any[]) => any;
    private INFO: (...args: any[]) => any;
    private logLevel: logLevel;
    private SILLY: (...args: any[]) => any;
    private VERBOSE: (...args: any[]) => any;
    private WARN: (...args: any[]) => any;

    public debug(...args: any[]): void {
        if (logLevelNumber[this.logLevel] >= logLevelNumber.debug) {
            this.DEBUG(...args);
        }
    }

    public error(...args: any[]): void {
        if (logLevelNumber[this.logLevel] >= logLevelNumber.error) {
            this.ERROR(...args);
        }
    }

    public info(...args: any[]): void {
        if (logLevelNumber[this.logLevel] >= logLevelNumber.info) {
            this.INFO(...args);
        }
    }

    public silly(...args: any[]): void {
        if (logLevelNumber[this.logLevel] >= logLevelNumber.silly) {
            this.SILLY(...args);
        }
    }

    public verbose(...args: any[]): void {
        if (logLevelNumber[this.logLevel] >= logLevelNumber.verbose) {
            this.VERBOSE(...args);
        }
    }

    public warn(...args: any[]): void {
        if (logLevelNumber[this.logLevel] >= logLevelNumber.warn) {
            this.WARN(...args);
        }
    }
}
