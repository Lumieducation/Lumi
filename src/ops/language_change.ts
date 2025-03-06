import i18next from 'i18next';

import setup_menu from '../menu';
import { Context } from '../boot';

export default async function language_change(
  ctx: Context,
  language_code: string
) {
  ctx.log.debug(`ops:language_change`, { language_code });
  await i18next.loadLanguages(language_code);
  await i18next.changeLanguage(language_code);

  setup_menu(ctx);
}
