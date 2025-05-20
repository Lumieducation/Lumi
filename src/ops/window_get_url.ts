import { BrowserWindow } from 'electron';

export default async function window_get_url(
  window: BrowserWindow
): Promise<string> {
  return window.webContents.getURL();
}
