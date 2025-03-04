import * as H5P from '@lumieducation/h5p-server';

export default function getUbernameFromH5pJso(
  h5pJson: H5P.IContentMetadata
): string {
  const library = (h5pJson.preloadedDependencies || []).find(
    (dependency) => dependency.machineName === h5pJson.mainLibrary
  );
  if (!library) {
    return '';
  }
  return H5P.LibraryName.toUberName(library, { useWhitespace: true });
}
