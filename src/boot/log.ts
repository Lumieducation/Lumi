import bunyan from 'bunyan';

export default function boot_logger(): bunyan.Logger {
  return bunyan.createLogger({
    name: 'lumi',
    level: process.env.LOG_LEVEL || 'info'
  });
}
