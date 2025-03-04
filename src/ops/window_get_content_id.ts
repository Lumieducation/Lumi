import { BrowserWindow } from 'electron';

import window_get_url from './window_get_url';

export default async function window_get_content_id(
  window: BrowserWindow
): Promise<string> {
  const url = await window_get_url(window);
  const content_id = url.split('/').pop();
  return content_id;
}
