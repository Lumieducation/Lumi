import fs from 'fs/promises';

import { Context } from '../boot';
import content_path from './content_path';

export default async function content_delete(
  ctx: Context,
  content_id: string
): Promise<void> {
  ctx.log.debug(`ops:content_delete`, { content_id });
  const path = content_path(ctx, content_id);

  await fs.rmdir(path, { recursive: true });
}
