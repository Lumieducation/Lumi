export interface IRun {
    id: string;
    secret: string;
    title: string;
    mainLibrary: string;
}

export interface IRunState {
    runs: IRun[];
}

export interface IState {
    run: IRunState;
}

export type RunActionTypes = 's';
