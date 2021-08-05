import defaultSettings from './defaultSettings';
import IH5PEditorSettings from './IH5PEditorSettings';

class SettingsStorage {
    constructor() {
        this.settings = defaultSettings;
    }
    public settings: IH5PEditorSettings;

    private subscribers: (() => void)[] = [];

    getSettings(): IH5PEditorSettings {
        return this.settings;
    }

    setSettings(s: IH5PEditorSettings): void {
        // We override the user defined values so that we have a feature flag in
        // the app code
        s.enableLumiRun = defaultSettings.enableLumiRun;

        this.settings = s;
        this.subscribers.forEach((subscriber) => subscriber());
    }

    subscribe(handler: () => void): void {
        this.subscribers.push(handler);
    }

    unsubscribe(handler: () => void): void {
        const index = this.subscribers.indexOf(handler);
        if (index >= 0) {
            this.subscribers.splice(index, 1);
        }
    }
}

export default new SettingsStorage();
