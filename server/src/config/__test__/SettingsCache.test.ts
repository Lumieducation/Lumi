import defaultSettings from '../defaultSettings';
import SettingsCache from '../SettingsCache';

describe('SettingsCache', () => {
    let settingsCache: SettingsCache;
    beforeEach(() => {
        settingsCache = new SettingsCache('dummy.json');
    });

    it('fixed es-419 (Spanish, Latin America) language codes', () => {
        const settings = { ...defaultSettings, language: 'es-419' };
        expect(settingsCache.validateAndFixSettings(settings)).toBe(true);
        expect(settings.language).toEqual('es');
    });

    it('leaves language codes like es-MX', () => {
        const settings = { ...defaultSettings, language: 'es-MX' };
        expect(settingsCache.validateAndFixSettings(settings)).toBe(false);
        expect(settings.language).toEqual('es-MX');
    });

    it('leaves language codes like es', () => {
        const settings = { ...defaultSettings, language: 'es' };
        expect(settingsCache.validateAndFixSettings(settings)).toBe(false);
        expect(settings.language).toEqual('es');
    });
});
