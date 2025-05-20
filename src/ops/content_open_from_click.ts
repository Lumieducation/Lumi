import { Context } from '../boot';
import window_open from './window_open';

export default async function content_open_from_click(
  ctx: Context
): Promise<string[]> {
  const openFilePaths = ctx.open_files;

  if (openFilePaths.length > 0) {
    ctx.log.debug(`content_open_from_argv`, { openFilePaths });
    openFilePaths.forEach(async (path) => {
      window_open(ctx, undefined, path);
    });
    return openFilePaths;
  }
  return [];
}
