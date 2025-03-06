import { autoUpdater, ProgressInfo } from 'electron-updater';

import { Context } from '../../boot';

export default function download_progress(ctx: Context) {
  autoUpdater.on('download-progress', (progress_info: ProgressInfo) => {
    ctx.log.info('events:autoUpdater:download-progress', progress_info);
  });
}
