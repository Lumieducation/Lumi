import { fsImplementations, IUser, ITemporaryFile } from 'h5p-nodejs-library';

/**
 * Stores temporary files in directories on the disk.
 * Manages access rights by creating one sub-directory for each user.
 * Manages expiration times by creating companion '.metadata' files for every
 * file stored.
 */
export default class DirectoryTemporaryFileStorage extends fsImplementations.DirectoryTemporaryFileStorage {
    public async listFiles(user?: IUser): Promise<ITemporaryFile[]> {
        return Promise.resolve([]);
    }
}
