interface ISettingsState {
    autoUpdates: boolean;
    bugTracking: boolean;
    firstOpen: boolean;
    language: string;
    lastVersion: string;
    privacyPolicyConsent: boolean;
    usageStatistics: boolean;
}

class SettingsStorage {
    public settings: ISettingsState;

    getSettings(): ISettingsState {
        return this.settings;
    }

    setSettings(s: ISettingsState): void {
        this.settings = s;
    }
}

export default new SettingsStorage();
