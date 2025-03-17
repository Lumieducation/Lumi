import path from 'path';
import { copy } from 'fs-extra';

import { Context } from '../boot';

export default async function libraries_copy(ctx: Context): Promise<void> {
  ctx.log.debug(`ops:libraries_copy`);

  // Determine the correct source directory
  const sourcePath =
    process.env.NODE_ENV === 'development'
      ? path.join(ctx.paths.app, 'assets', 'h5p', 'libraries')
      : path.join(
          process.resourcesPath,
          'app.asar.unpacked',
          'assets',
          'h5p',
          'libraries'
        );

  ctx.log.debug(`Copying from: ${sourcePath} to: ${ctx.paths.libraries}`);

  try {
    await copy(sourcePath, ctx.paths.libraries);
    ctx.log.debug(`Libraries copied successfully.`);
  } catch (error) {
    ctx.log.error(`Error copying libraries: ${error}`);
  }
}
