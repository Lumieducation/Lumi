export class Target {
    constructor() {
        this.target =
            window.location.hostname === 'localhost' ? 'electron' : 'platform';
    }

    private target: 'platform' | 'electron';

    public get(): 'electron' | 'platform' {
        return this.target;
    }
}

export default new Target();
