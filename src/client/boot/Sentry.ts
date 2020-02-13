import * as Sentry from '@sentry/browser';

if (process.env.NODE_ENV !== 'development') {
    Sentry.init({
        // beforeSend: (event: Sentry.Event) => {
        //     // Check if it is an exception, and if so, show the report dialog
        //     return event;
        // },
        dsn: 'https://f3017e59ed9c4c82b7099adead439ccb@sentry.io/1836744',
        release: `editor@${process.env.VERSION}`
    });
}

export default Sentry;
