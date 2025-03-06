import bunyan from 'bunyan';
import log from 'electron-log/main';

export default function boot_logger(): bunyan.Logger {
  log.initialize();
  return log;
}
