import { app } from 'electron';
import fsExtra from 'fs-extra';

import defaultSettings from './defaultSettings';
import IH5PEditorSettings from './IH5PEditorSettings';

/**
 * Allows access to global settings and offers persistence. If you use
 * getSettings or getSettingsSync the settings are loaded from the settings file
 * in the user directory if necessary. Save settings stores all changes in the
 * settings to the settings file in the user directory.
 */
export default class SettingsStorage {
    constructor(private settingsFile: string) {}

    /**
     * Internal storage of the settings data.
     */
    private settings: IH5PEditorSettings;

    /**
     * List of listeners.
     */
    private subscribers: (() => void)[] = [];

    /**
     * Returns the settings. Loads them from the file in the user directory if
     * necessary.
     */
    async getSettings(): Promise<IH5PEditorSettings> {
        if (!this.settings) {
            await this.loadSettings();
        }
        return this.settings;
    }

    /**
     * Returns the settings. Loads them from the file in the user directory if
     * necessary.
     */
    getSettingsSync(): IH5PEditorSettings {
        if (!this.settings) {
            this.loadSettingsSync();
        }
        return this.settings;
    }

    /**
     * Saves the settings so that they can be used elsewhere in the program.
     * Also persists these changes to the settings file in the user directory.
     */
    async saveSettings(s: IH5PEditorSettings): Promise<void> {
        this.settings = s;
        await fsExtra.writeJSON(this.settingsFile, this.settings);
        this.subscribers.forEach((subscriber) => subscriber());
    }

    /**
     * You can subscribe to changes in the settings. Don't forget to unsubscribe
     * to avoid memory leaks.
     */
    subscribe(handler: () => void): void {
        this.subscribers.push(handler);
    }

    /**
     * Unsubscribe from settings here to avoid memory leaks.
     */
    unsubscribe(handler: () => void): void {
        const index = this.subscribers.indexOf(handler);
        if (index >= 0) {
            this.subscribers.splice(index, 1);
        }
    }

    /**
     * Loads the settings from the file or creates a new file if none existed so
     * far.
     */
    private async loadSettings(): Promise<void> {
        // Check if current settings exists and is read- and parsable
        let settingsOk = false;
        try {
            if (await fsExtra.pathExists(this.settingsFile)) {
                const loadedSettings = await fsExtra.readJSON(
                    this.settingsFile
                );
                this.settings = this.mergeSettings(loadedSettings);
                settingsOk = true;
            }
        } catch (error) {
            settingsOk = false;
        }

        if (!settingsOk) {
            this.settings = {
                ...defaultSettings,
                language: app.getLocale()
            };
            await fsExtra.writeJSON(this.settingsFile, this.settings);
        }
    }

    /**
     * Loads the settings from the file or creates a new file if none existed so
     * far.
     */
    private loadSettingsSync(): void {
        // Check if current settings exists and is read- and parsable
        let settingsOk = false;
        try {
            if (fsExtra.pathExistsSync(this.settingsFile)) {
                const loadedSettings = fsExtra.readJSONSync(this.settingsFile);
                this.settings = this.mergeSettings(loadedSettings);
                settingsOk = true;
            }
        } catch (error) {
            settingsOk = false;
        }

        if (!settingsOk) {
            this.settings = {
                ...defaultSettings,
                language: app.getLocale()
            };
            fsExtra.writeJSONSync(this.settingsFile, this.settings);
        }
    }

    private mergeSettings(
        loadedSettings: IH5PEditorSettings
    ): IH5PEditorSettings {
        return {
            ...defaultSettings,
            ...{
                allowPrerelease: loadedSettings.allowPrerelease,
                autoUpdates: loadedSettings.autoUpdates,
                bugTracking: loadedSettings.autoUpdates,
                email: loadedSettings.email,
                firstOpen: loadedSettings.firstOpen,
                h5pUuid: loadedSettings.h5pUuid,
                language: loadedSettings.language,
                lastVersion: loadedSettings.lastVersion,
                privacyPolicyConsent: loadedSettings.privacyPolicyConsent,
                token: loadedSettings.token,
                usageStatistics: loadedSettings.usageStatistics
            }
        };
    }
}
