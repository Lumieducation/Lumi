import * as Sentry from '@sentry/browser';
import superagent from 'superagent';

if (process.env.NODE_ENV !== 'development') {
    try {
        superagent.get(`/api/v1/settings`).then((response) => {
            if (response.body.bugTracking) {
                Sentry.init({
                    dsn:
                        'http://1f4ae874b81a48ed8e22fe6e9d52ed1b@sentry.lumi.education/3',
                    release: process.env.VERSION,
                    environment: process.env.NODE_ENV
                });
                Sentry.setTag('type', 'client');
            }
        });
    } catch (error) {
        console.log(error);
    }
}

export default Sentry;
