import { ContentId, IH5P } from './types';

export default class H5P implements IH5P {
    constructor(id?: ContentId, library?: string) {
        this.id = 0;
        this.library = '';
    }
    public id: ContentId;
    public library: string;
    public params: any;
}
