import { app } from 'electron';
import fsExtra from 'fs-extra';
import { supportedLocales } from '../boot/i18n';

import defaultSettings from './defaultSettings';
import IH5PEditorSettings from './IH5PEditorSettings';
import Logger from '../helpers/Logger';
import { nanoid } from 'nanoid';

const log = new Logger('SettingsStorage');

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

    init(): void {
        log.debug('Sending initial notification that settings are available.');
        this.subscribers.forEach((subscriber) => subscriber());
    }

    /**
     * Saves the settings so that they can be used elsewhere in the program.
     * Also persists these changes to the settings file in the user directory.
     */
    async saveSettings(s: IH5PEditorSettings): Promise<void> {
        log.debug('Saving settings to file');
        this.settings = s;
        await fsExtra.writeJSON(this.settingsFile, this.settings);

        log.debug('Notifying subscribers of settings change');
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
     * Checks if the values of the settings are correct and fixes them if
     * necessary.
     * @param settings
     * @returns true if the settings were changed, false if they remained the
     * same
     */
    public validateAndFixSettings(settings: IH5PEditorSettings): boolean {
        let changed = false;

        log.debug(`Validating settings. Language: ${settings.language}`);
        let lng = settings.language;
        if (!lng) {
            settings.language = 'en';
            changed = true;
        } else {
            let lngOk = false;
            // allow regular language codes like de-DE or zh-HANS
            if (
                !/^[a-z]{2,3}(-[A-Z]{2,6})?$/i.test(settings.language) ||
                !supportedLocales.find((l) => l.code === lng)
            ) {
                log.debug(
                    'The language in the settings is either malformed or not in the list of supported locales.'
                );
                // converts es-419 into es
                const res = /^([a-z]{2,3})(-.{2,6})?$/i.exec(settings.language);
                if (res.length > 0) {
                    log.debug('Removing variant code from language');
                    lng = res[1];
                }
            }
            if (supportedLocales.find((l) => l.code === lng)) {
                if (settings.language !== lng) {
                    log.debug(
                        `Changing language '${settings.language}' to '${lng}'`
                    );
                    settings.language = lng;
                    changed = true;
                    lngOk = true;
                }
                log.debug('Language code is ok');
                lngOk = true;
            }
            if (!lngOk) {
                log.debug('Falling back to English language.');
                settings.language = 'en';
                changed = true;
            }
        }

        if (!settings.machineId || settings.machineId === '') {
            log.debug('Generating new machine id');
            settings.machineId = nanoid();
            changed = true;
        }

        return changed;
    }

    /**
     * Loads the settings from the file or creates a new file if none existed so
     * far.
     */
    private async loadSettings(): Promise<void> {
        log.debug('Loading settings from file');
        let settingsOk = false;
        let saveSettings = false;

        // Check if current settings exists and are read- and parsable
        try {
            if (await fsExtra.pathExists(this.settingsFile)) {
                const loadedSettings = await fsExtra.readJSON(
                    this.settingsFile
                );
                log.debug('Loaded valid settings file');
                this.settings = this.mergeSettings(loadedSettings);
                saveSettings = this.validateAndFixSettings(this.settings);
                if (saveSettings) {
                    log.debug('Settings values were invalid and repaired.');
                }
                settingsOk = true;
            }
        } catch (error: any) {
            settingsOk = false;
        }

        if (!settingsOk) {
            log.debug(
                `There was an error loading the settings file. Either none exists or it is malformed. Generating new file. locale: ${app.getLocale()}`
            );

            this.settings = {
                ...defaultSettings,
                language: app.getLocale()
            };
            this.validateAndFixSettings(this.settings);
            saveSettings = true;
        }

        if (saveSettings) {
            log.debug('Saving new settings to file');
            await fsExtra.writeJSON(this.settingsFile, this.settings);
        }
    }

    /**
     * Loads the settings from the file or creates a new file if none existed so
     * far.
     */
    private loadSettingsSync(): void {
        let settingsOk = false;
        let saveSettings = false;

        try {
            // Check if current settings exists and are read- and parsable
            if (fsExtra.pathExistsSync(this.settingsFile)) {
                const loadedSettings = fsExtra.readJSONSync(this.settingsFile);
                log.debug('Loaded valid settings file');
                this.settings = this.mergeSettings(loadedSettings);
                saveSettings = this.validateAndFixSettings(this.settings);
                if (saveSettings) {
                    log.debug('Settings values were invalid and repaired.');
                }
                settingsOk = true;
            }
        } catch (error: any) {
            settingsOk = false;
        }

        if (!settingsOk) {
            log.debug(
                `There was an error loading the settings file. Either none exists or it is malformed. Generating new file. locale: ${app.getLocale()}`
            );
            this.settings = {
                ...defaultSettings,
                language: app.getLocale()
            };
            this.validateAndFixSettings(this.settings);
            saveSettings = true;
        }

        if (saveSettings) {
            log.debug('Saving new settings to file');
            fsExtra.writeJSONSync(this.settingsFile, this.settings);
        }
    }

    /**
     * Merges the default settings with loadedSettings. Only allowed properties
     * are taken from loadedSettings, so it acts as a migrator of old setting
     * structure after updates.
     * @param loadedSettings
     * @returns the merged settings
     */
    private mergeSettings(
        loadedSettings: IH5PEditorSettings
    ): IH5PEditorSettings {
        return {
            ...defaultSettings,
            ...{
                allowPrerelease: loadedSettings.allowPrerelease,
                autoUpdates: loadedSettings.autoUpdates,
                bugTracking: loadedSettings.bugTracking,
                email: loadedSettings.email,
                firstOpen: loadedSettings.firstOpen,
                h5pUuid: loadedSettings.h5pUuid,
                language: loadedSettings.language,
                lastVersion: loadedSettings.lastVersion,
                privacyPolicyConsent: loadedSettings.privacyPolicyConsent,
                token: loadedSettings.token,
                usageStatistics: loadedSettings.usageStatistics,
                machineId: loadedSettings.machineId
            }
        };
    }
}
