import * as H5P from 'h5p-nodejs-library';

/**
 * Create a H5PEditor object.
 * Which storage classes are used depends on the configuration values set in
 * the environment variables. If you set no environment variables, the local
 * filesystem storage classes will be used.
 *
 * Further environment variables to set up MongoDB and S3 can be found in
 * docs/mongo-s3-content-storage.md and docs/s3-temporary-file-storage.md!
 * @param config the configuration object
 * @param localLibraryPath a path in the local filesystem in which the H5P libraries (content types) are stored
 * @param localContentPath a path in the local filesystem in which H5P content will be stored (only necessary if you want to use the local filesystem content storage class)
 * @param localTemporaryPath a path in the local filesystem in which temporary files will be stored (only necessary if you want to use the local filesystem temporary file storage class).
 * @param translationCallback a function that is called to retrieve translations of keys in a certain language; the keys use the i18next format (e.g. namespace:key).
 * @returns a H5PEditor object
 */
export default async function createH5PEditor(
    config: H5P.IH5PConfig,
    localLibraryPath: string,
    localContentPath?: string,
    localTemporaryPath?: string,
    translationCallback?: H5P.ITranslationFunction
): Promise<H5P.H5PEditor> {
    // Depending on the environment variables we use different implementations
    // of the storage interfaces.
    const h5pEditor = new H5P.H5PEditor(
        new H5P.fsImplementations.InMemoryStorage(), // this is a general-purpose cache
        config,
        new H5P.fsImplementations.FileLibraryStorage(localLibraryPath),
        new H5P.fsImplementations.FileContentStorage(localContentPath),
        new H5P.fsImplementations.DirectoryTemporaryFileStorage(
            localTemporaryPath
        ),
        translationCallback
    );

    return h5pEditor;
}
