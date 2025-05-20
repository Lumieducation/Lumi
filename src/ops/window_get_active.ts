import { BrowserWindow } from 'electron';

export default function window_get_active(): BrowserWindow {
  const window = BrowserWindow.getFocusedWindow();
  if (window === null) {
    throw new Error('No active window');
  }
  return window;
}
