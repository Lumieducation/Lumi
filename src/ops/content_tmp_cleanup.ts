import fs from 'fs/promises';

import { Context } from '../boot';

export default async function content_tmp_cleanup(ctx: Context): Promise<void> {
  ctx.log.debug(`ops:content_tmp_cleanup`, ctx.paths.tmp);
  await fs.rm(ctx.paths.tmp, { recursive: true });
}
