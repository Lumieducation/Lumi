import i18next from 'i18next';

import { Context } from '../boot';
import { show_settings_menu } from '../menu';

export default async function language_change(
  ctx: Context,
  language_code: string
) {
  ctx.log.debug(`ops:language_change`, { language_code });
  await i18next.loadLanguages(language_code);
  await i18next.changeLanguage(language_code);

  show_settings_menu(ctx);
}
