import * as Sentry from '@sentry/browser';
import store from '../state';
import { track } from '../state/track/actions';

Sentry.init({
    dsn: 'https://1f4ae874b81a48ed8e22fe6e9d52ed1b@sentry.lumi.education/3',
    release: process.env.VERSION,
    environment: process.env.NODE_ENV,
    beforeSend: (event: Sentry.Event) => {
        if (store.getState().settings.bugTracking) {
            store.dispatch(track('error', event.event_id || 'sentry'));
            return event;
        }
        return null;
    }
});
Sentry.setTag('type', 'client');

export default Sentry;
