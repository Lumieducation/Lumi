import { nanoid } from 'nanoid';

import FileHandle from './FileHandle';

export default class FileHandleManager {
    private handles: Map<string, string> = new Map<string, string>();

    public create(filename: string): FileHandle {
        const id = nanoid();
        this.handles.set(id, filename);
        return new FileHandle(id, filename);
    }

    public delete(id: string): void {
        this.handles.delete(id);
    }

    public getById(id: string): FileHandle {
        const filename = this.handles.get(id);
        if (filename) {
            return new FileHandle(id, filename);
        }

        return undefined;
    }
}
