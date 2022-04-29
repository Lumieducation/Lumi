import { app } from 'electron';
import IH5PEditorSettings from './IH5PEditorSettings';

const defaultSettings: IH5PEditorSettings = {
    allowPrerelease: false,
    autoUpdates: false,
    bugTracking: false,
    email: '',
    enableLumiRun: false, // This is a flag that's not user configurable but globally set here
    firstOpen: true,
    language: 'en',
    lastVersion: app?.getVersion() ?? 'test',
    privacyPolicyConsent: false,
    token: '',
    usageStatistics: false,
    h5pUuid: '',
    machineId: ''
};

export default defaultSettings;
