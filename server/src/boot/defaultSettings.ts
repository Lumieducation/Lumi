import { app } from 'electron';

export default {
    allowPrerelease: false,
    autoUpdates: false,
    bugTracking: false,
    email: '',
    enableLumiRun: false, // This is a flag that's not user configurable but globally set here
    firstOpen: true,
    language: 'en',
    lastVersion: app ? app.getVersion() : 'test',
    privacyPolicyConsent: false,
    token: '',
    usageStatistics: false
};
