import { app } from 'electron';

export default {
    bugTracking: false,
    firstOpen: true,
    privacyPolicyConsent: false,
    usageStatistics: false,
    lastVersion: app.getVersion(),
    autoUpdates: false
};
