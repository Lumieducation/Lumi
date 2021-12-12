export interface IElectronState {
    /**
     * Blocks all keyboard interaction in the window.
     */
    blockKeyboard: boolean;
    /**
     * The last directory the user navigated to in a file picker.
     */
    lastDirectory: string;
}

export default class StateStorage {
    constructor() {
        this.state = {
            blockKeyboard: false,
            lastDirectory: ''
        };
    }
    public state: IElectronState;

    getState(): IElectronState {
        return this.state;
    }

    setState(s: Partial<IElectronState>): void {
        this.state = { ...this.state, ...s };
    }
}
