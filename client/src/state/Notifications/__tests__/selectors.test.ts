import * as selectors from '../NotificationsSelectors';

describe('notifications()', () => {
    it('returns all notifications', async () => {
        const testList = [{ test: 'data' }, { test: 'data2' }];
        const state = {
            notifications: {
                notifications: testList
            }
        };

        expect(selectors.notifications(state as any)).toEqual(testList);
    });
});
