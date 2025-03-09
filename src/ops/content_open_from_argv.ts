import { Context } from '../boot';
import window_open from './window_open';
import content_import from './content_import';
import content_config_write from './content_config_write';

export default async function content_open_from_argv(
  ctx: Context
): Promise<string[]> {
  const { argv } = process;
  if (argv.length >= 2) {
    // Check if there are H5Ps specified in the command line args and
    // load them (Windows only).
    argv.splice(0, 1);
    const openFilePaths = argv.filter((arg) => arg.endsWith('.h5p'));

    if (openFilePaths.length > 0) {
      ctx.log.debug(`content_open_from_argv`, { openFilePaths });
      openFilePaths.forEach(async (path) => {
        const content = await content_import(ctx, [path]);
        if (content.length > 0) {
          await content_config_write(
            ctx,
            content[0].id,
            'path',
            content[0].path
          );
          await window_open(ctx, content[0].id);
        }
      });
      return openFilePaths;
    }
    return [];
  }
  return [];
}
