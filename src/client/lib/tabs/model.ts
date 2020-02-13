import shortid from 'shortid';

import { ContentId, ITab, TabState } from './types';

export default class Tab implements ITab {
    constructor(name: string, path?: string) {
        this.id = shortid();
        this.loadingState = 'pending';
        this.loadingIndicator = true;
        this.mainLibrary = '';
        this.name = name;
        this.path = path;
        this.state = 'opening';
    }

    public contentId?: ContentId;
    public id: string;
    public loadingIndicator: boolean;
    public loadingState: 'error' | 'pending' | 'success';
    public mainLibrary: string;
    public name: string;
    public path?: string;
    public savingState?: 'error' | 'pending' | 'success';
    public state: TabState;

    public setLoadingState(state: 'error' | 'pending' | 'success'): Tab {
        this.loadingState = state;
        return this;
    }
}
