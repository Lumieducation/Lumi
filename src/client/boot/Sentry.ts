import * as Sentry from '@sentry/browser';

if (process.env.NODE_ENV !== 'development') {
    Sentry.init({
        dsn: 'https://02e4da31636d479f86a17a6ef749278c@sentry.io/1876151',
        release: process.env.VERSION
    });
}

export default Sentry;
