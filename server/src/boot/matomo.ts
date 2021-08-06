import MatomoTrack from 'matomo-tracker';
import * as Sentry from '@sentry/electron';

const matomo = new MatomoTrack(1, 'https://matomo.lumi.education/matomo.php');

matomo.on('error', (error) => {
    Sentry.captureException(error);
});
export default matomo;
