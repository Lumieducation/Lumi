import { app } from 'electron';

export default {
    bugTracking: false,
    firstOpen: true,
    privacyPolicyConsent: false,
    usageStatistics: false,
    lastVersion: app ? app.getVersion() : 'test',
    autoUpdates: false,
    language: 'en',
    email: '',
    token: ''
};
