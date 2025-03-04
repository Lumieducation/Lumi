import * as H5P from '@lumieducation/h5p-server';

/**
 * Create a H5PEditor object.
 *
 * @param config the configuration object
 * @param localLibraryPath a path in the local filesystem in which the H5P
 * libraries (content types) are stored
 * @param localContentPath a path in the local filesystem in which H5P content
 * will be stored (only necessary if you want to use the local filesystem
 * content storage class)
 * @param localTemporaryPath a path in the local filesystem in which temporary
 * files will be stored (only necessary if you want to use the local filesystem
 * temporary file storage class).
 * @param translationCallback a function that is called to retrieve translations
 * of keys in a certain language; the keys use the i18next format (e.g.
 * namespace:key).
 * @returns a H5PEditor object
 */
export default async function bootH5PEditor(
  config: H5P.IH5PConfig,
  localLibraryPath: string,
  localContentPath?: string,
  localTemporaryPath?: string,
  translationCallback?: H5P.ITranslationFunction,
  options?: {
    disableLibraryCache?: boolean;
  }
): Promise<H5P.H5PEditor> {
  const libStorage = new H5P.fsImplementations.FileLibraryStorage(
    localLibraryPath
  );
  // Depending on the environment variables we use different implementations
  // of the storage interfaces.
  const h5pEditor = new H5P.H5PEditor(
    new H5P.fsImplementations.InMemoryStorage(), // this is a general-purpose cache
    config,
    options?.disableLibraryCache
      ? libStorage
      : new H5P.cacheImplementations.CachedLibraryStorage(libStorage),
    new H5P.fsImplementations.FileContentStorage(localContentPath),
    new H5P.fsImplementations.DirectoryTemporaryFileStorage(localTemporaryPath),
    translationCallback,
    undefined,
    {
      customization: {
        global: {
          styles: ['/assets/h5p/h5p-editor-overrides.css']
        }
      },
      enableHubLocalization: true,
      enableLibraryNameLocalization: true
    }
  );

  h5pEditor.setRenderer((model) => model);

  await h5pEditor.contentTypeCache.forceUpdate();

  return h5pEditor;
}
