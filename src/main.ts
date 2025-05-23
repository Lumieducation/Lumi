import boot from './boot';
import { show_content_menu } from './menu';
import settings_check from './ops/settings_check';
import setup_electron_events from './events/app/setup_app_events';
import setup_auto_updater from './events/autoUpdater/setup_auto_updater';

async function main(): Promise<void> {
  const context = await boot();
  await settings_check(context);

  context.log.info(`argv`, process.argv);
  await setup_electron_events(context);
  await setup_auto_updater(context);
  await show_content_menu(context);
}

main();
