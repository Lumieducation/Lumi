import { Context } from '../boot';
import window_open from './window_open';
import content_import from './content_import';
import content_config_write from './content_config_write';

export default async function content_open_from_click(
  ctx: Context
): Promise<string[]> {
  const openFilePaths = ctx.open_files;

  if (openFilePaths.length > 0) {
    ctx.log.debug(`content_open_from_argv`, { openFilePaths });
    openFilePaths.forEach(async (path) => {
      const content = await content_import(ctx, [path]);
      if (content.length > 0) {
        await content_config_write(ctx, content[0].id, 'path', content[0].path);
        await window_open(ctx, content[0].id);
      }
    });
    return openFilePaths;
  }
  return [];
}
