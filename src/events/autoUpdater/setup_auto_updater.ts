import { autoUpdater } from 'electron-updater';

import { Context } from '../../boot';
import update_available from './update-available';
import settings_read from '../../ops/settings_read';
import update_downloaded from './update-downloaded';
import download_progress from './download-progress';
import checking_for_update from './checking-for-update';
import update_not_available from './update-not-available';

export default async function setup_auto_updater(ctx: Context) {
  const settings = await settings_read(ctx);

  ctx.log.info(`events:autoUpdater:setup_auto_updater`, settings);

  autoUpdater.allowPrerelease = settings.prerelease_features;
  autoUpdater.autoDownload = settings.updates_automatic;

  // Force auto-updates in dev mode
  if (ctx.is_development) {
    autoUpdater.autoDownload = false;
    autoUpdater.allowDowngrade = false;
    autoUpdater.forceDevUpdateConfig = true; // Forces updates in dev mode
  }

  checking_for_update(ctx);
  update_available(ctx);
  update_downloaded(ctx);
  download_progress(ctx);
  update_not_available(ctx);
}
