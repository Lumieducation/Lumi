import * as Sentry from '@sentry/browser';
import store from '../state';

Sentry.init({
    dsn: 'http://1f4ae874b81a48ed8e22fe6e9d52ed1b@sentry.lumi.education/3',
    release: process.env.VERSION,
    environment: process.env.NODE_ENV,
    beforeSend: (event: Sentry.Event, hint: Sentry.EventHint) => {
        if (store.getState().settings.bugTracking) {
            return event;
        }
        return null;
    }
});
Sentry.setTag('type', 'client');

export default Sentry;
