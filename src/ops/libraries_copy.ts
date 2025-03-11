import path from 'path';
import { copy } from 'fs-extra';

import { Context } from '../boot';

export default async function libraries_copy(ctx: Context): Promise<void> {
  ctx.log.debug(`ops:libraries_copy`);

  await copy(
    path.join(ctx.paths.app, 'assets', 'h5p', 'libraries'),
    ctx.paths.libraries
  );
}
