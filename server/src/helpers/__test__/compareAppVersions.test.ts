import { compareAppVersions } from '../compareAppVersions';

describe('compareAppVersions', () => {
    it('0.2.0 > 0.1.0', () => {
        expect(compareAppVersions('0.1.0', '0.2.0')).toBeGreaterThan(0);
    });

    it('0.2.1 > 0.2.0', () => {
        expect(compareAppVersions('0.1.0', '0.2.0')).toBeGreaterThan(0);
    });

    it('1.0.1 > 0.9.0', () => {
        expect(compareAppVersions('0.1.0', '0.2.0')).toBeGreaterThan(0);
    });

    it('0.1.0 < 0.2.0', () => {
        expect(compareAppVersions('0.2.0', '0.1.0')).toBeLessThan(0);
    });

    it('0.1.0 = 0.1.0', () => {
        expect(compareAppVersions('0.1.0', '0.1.0')).toEqual(0);
    });

    it('0.2.0 > 0.2.0-beta1', () => {
        expect(compareAppVersions('0.2.0-beta1', '0.2.0')).toBeGreaterThan(0);
    });

    it('0.2.0-beta2 > 0.2.0-beta10', () => {
        expect(
            compareAppVersions('0.2.0-beta1', '0.2.0-beta10')
        ).toBeGreaterThan(0);
    });

    it('0.3.0 > 0.2.0-beta1', () => {
        expect(compareAppVersions('0.2.0-beta1', '0.3.0')).toBeGreaterThan(0);
    });
});
