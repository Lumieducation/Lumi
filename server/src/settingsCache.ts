interface ISettingsState {
    allowPrerelease: boolean;
    autoUpdates: boolean;
    bugTracking: boolean;
    email: string;
    firstOpen: boolean;
    language: string;
    lastVersion: string;
    privacyPolicyConsent: boolean;
    token: string;
    usageStatistics: boolean;
}

import defaultSettings from './boot/defaultSettings';

class SettingsStorage {
    constructor() {
        this.settings = defaultSettings;
    }
    public settings: ISettingsState;

    getSettings(): ISettingsState {
        return this.settings;
    }

    setSettings(s: ISettingsState): void {
        this.settings = s;
    }
}

export default new SettingsStorage();
