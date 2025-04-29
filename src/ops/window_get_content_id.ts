import { BrowserWindow } from 'electron';

import window_get_url from './window_get_url';

export default async function window_get_content_id(
  window: BrowserWindow
): Promise<string> {
  const url = await window_get_url(window);
  const _url = new URL(url);
  const { pathname } = _url;
  const path_parts = pathname.split('/');
  const content_id = path_parts[path_parts.length - 1];
  return content_id;
}
