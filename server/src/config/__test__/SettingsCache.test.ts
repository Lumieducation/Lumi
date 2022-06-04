import defaultSettings from '../defaultSettings';
import SettingsCache from '../SettingsCache';

describe('SettingsCache', () => {
    let settingsCache: SettingsCache;
    beforeEach(() => {
        settingsCache = new SettingsCache('dummy.json');
    });

    it('fixed es-419 (Spanish, Latin America) language codes', () => {
        const settings = {
            ...defaultSettings,
            machineId: '123',
            language: 'es-419'
        };
        expect(settingsCache.validateAndFixSettings(settings)).toBe(true);
        expect(settings.language).toEqual('es');
    });

    it('leaves language codes like es-MX', () => {
        const settings = {
            ...defaultSettings,
            machineId: '123',
            language: 'es-mx'
        };
        expect(settingsCache.validateAndFixSettings(settings)).toBe(false);
        expect(settings.language).toEqual('es-mx');
    });

    it('leaves language codes like es', () => {
        const settings = {
            ...defaultSettings,
            machineId: '123',
            language: 'es'
        };
        expect(settingsCache.validateAndFixSettings(settings)).toBe(false);
        expect(settings.language).toEqual('es');
    });

    it('generates machineId', () => {
        const settings = { ...defaultSettings };
        expect(settingsCache.validateAndFixSettings(settings)).toBe(true);
        expect(settings.machineId).not.toEqual('');
    });

    it('leaves existing machineId', () => {
        const settings = {
            ...defaultSettings,
            language: 'de',
            machineId: 'asd'
        };
        expect(settingsCache.validateAndFixSettings(settings)).toBe(false);
        expect(settings.machineId).toEqual('asd');
    });
});
