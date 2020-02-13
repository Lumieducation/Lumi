import Logger from './Logger';

const log = new Logger('helpers:Editor');

declare var window: any;

export default class Editor {
    constructor(id: string) {
        this.id = id;

        this.params = {};
        this.library = '';
    }

    private id: string;
    private library: string;
    private params: any;

    public getLibrary(): string {
        try {
            this.library = window.editor[this.id].getLibrary();
        } catch (error) {
            log.error(error);
        }

        return this.library;
    }

    public getParams(): any {
        try {
            this.params = window.editor[this.id].getParams();
        } catch (error) {
            log.error(error);
        }

        return this.params;
    }
}
