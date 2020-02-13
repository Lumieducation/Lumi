import directoryTree from 'directory-tree';
import { dialog } from 'electron';
import fs from 'fs';
import _path from 'path';

export class FS {
    public async createFS(
        path: string,
        name: string,
        type: 'directory' | 'file'
    ): Promise<{ path: string; type: 'directory' | 'file' }> {
        if (type === 'directory') {
            const dir = _path.join(path, name);
            if (fs.existsSync(dir)) {
                throw new Error('directory already exists');
            }
            fs.mkdirSync(dir);
            return { path: dir, type: 'directory' };
        }
        if (type === 'file') {
            let filename = name;
            if (_path.extname(filename) !== '.h5p') {
                filename = `${filename}.h5p`;
            }

            const file = _path.join(path, filename);

            fs.writeFileSync(file, null);
            return { path: file, type: 'file' };
        }
    }

    public fileTree = async (root?: string) => {
        let response;
        if (!root) {
            response = await dialog.showOpenDialog({
                filters: [
                    {
                        extensions: ['h5p'],
                        name: 'HTML 5 Package'
                    }
                ],
                properties: ['openDirectory']
            });
        }

        const path = root || response.filePaths[0];

        return directoryTree(path, {
            extensions: /\.h5p$/
        });
    };

    public openFolder = async () => {
        return { folder: '/H5P' };
    };
}

export default new FS();
