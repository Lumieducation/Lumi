import * as Sentry from '@sentry/browser';
import store from '../state';
import { track } from '../state/track/actions';

Sentry.init({
    dsn: 'https://c9daaaa874704f15b172ada7ebf44c87@sen.lumi.education/2',
    release: process.env.VERSION,
    environment: process.env.NODE_ENV,
    beforeSend: (event: Sentry.Event, hint: Sentry.EventHint) => {
        if (store.getState().settings.bugTracking) {
            store.dispatch(track('error', event.event_id || 'sentry'));
            return event;
        }
        return null;
    }
});
Sentry.setTag('type', 'client');

export default Sentry;
