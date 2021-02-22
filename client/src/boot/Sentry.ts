import * as Sentry from '@sentry/browser';

if (process.env.NODE_ENV !== 'development') {
    Sentry.init({
        dsn: 'http://1f4ae874b81a48ed8e22fe6e9d52ed1b@sentry.lumi.education/3',
        release: process.env.VERSION
    });
}

export default Sentry;
