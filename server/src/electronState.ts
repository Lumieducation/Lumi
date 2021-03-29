interface IElectronState {
    blockKeyboard: boolean;
}

class StateStorage {
    constructor() {
        this.state = {
            blockKeyboard: false
        };
    }
    public state: IElectronState;

    getState(): IElectronState {
        return this.state;
    }

    setState(s: IElectronState): void {
        this.state = s;
    }
}

export default new StateStorage();
