import * as H5P from '@lumieducation/h5p-server';

export default async function bootH5pPlayer(
  config: H5P.IH5PConfig,
  h5pEditor: H5P.H5PEditor
): Promise<H5P.H5PPlayer> {
  const h5pPlayer = new H5P.H5PPlayer(
    h5pEditor.libraryStorage,
    h5pEditor.contentStorage,
    config,
    undefined,
    undefined,
    undefined,
    {},
    h5pEditor.contentUserDataStorage
  );

  h5pPlayer.setRenderer((model) => model);

  return h5pPlayer;
}
