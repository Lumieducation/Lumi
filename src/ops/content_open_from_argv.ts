import { Context } from '../boot';
import window_open from './window_open';

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
        await window_open(ctx, undefined, path);
      });

      return openFilePaths;
    }
    return [];
  }
  return [];
}
