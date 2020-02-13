import * as selectors from '../selectors';

describe('notifications()', () => {
    it('returns all notifications', done => {
        const testList = [{ test: 'data' }, { test: 'data2' }];
        const state = {
            notifications: {
                notifications: testList
            }
        };

        expect(selectors.notifications(state as any)).toEqual(testList);
        done();
    });
});
