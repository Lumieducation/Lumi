import { app } from 'electron';

import { Context } from '../boot';
import settings_read from './settings_read';

export default async function proxy_setup(ctx: Context): Promise<void> {
  const settings = await settings_read(ctx);

  // set proxy from settings
  if (settings.http_proxy) {
    app.commandLine.appendSwitch('proxy-server', settings.http_proxy);
    process.env.HTTP_PROXY = settings.http_proxy;
    ctx.log.info('HTTP Proxy set from settings:', settings.http_proxy);
  }

  if (settings.https_proxy) {
    app.commandLine.appendSwitch('proxy-server', settings.https_proxy);
    process.env.HTTPS_PROXY = settings.https_proxy;
    ctx.log.info('HTTPS Proxy set from settings:', settings.https_proxy);
  }

  // set proxy from command-line

  const proxy = process.argv.find((arg) => arg.startsWith('--proxy-server='));

  if (proxy) {
    process.env.HTTP_PROXY = proxy.split('=')[1];
    process.env.HTTPS_PROXY = proxy.split('=')[1];
    app.commandLine.appendSwitch('proxy-server', proxy.split('=')[1]);
    ctx.log.info('Proxy set from command-line:', proxy.split('=')[1]);
  }
}
