import * as selectors from '../H5PEditorSelectors';

describe('all()', () => {
    it('returns all tabs', (done) => {
        const testList = [{ test: 'data' }, { test: 'data2' }];
        const state = {
            tabs: {
                list: testList
            }
        };

        expect(selectors.all(state as any)).toEqual(testList);
        done();
    });

    it('returns an empty array, if state is corrupt', (done) => {
        const state = {
            tabs: {}
        };

        expect(selectors.all(state as any)).toEqual([]);
        done();
    });

    it('returns an empty array, if something goes wrong', (done) => {
        const state = {};

        expect(selectors.all(state as any)).toEqual([]);
        done();
    });
});

describe('activeTabIndex', () => {
    it('returns the activeTabIndex', (done) => {
        const activeTabIndex = 1337;
        expect(
            selectors.activeTabIndex({
                tabs: {
                    activeTabIndex
                }
            } as any)
        ).toBe(activeTabIndex);
        done();
    });

    it('returns 0 if state is corrupt', (done) => {
        expect(
            selectors.activeTabIndex({
                tabs: {}
            } as any)
        ).toBe(0);
        done();
    });

    it('returns 0 if an error is thrown', (done) => {
        expect(selectors.activeTabIndex({} as any)).toBe(0);
        done();
    });
});

describe('activeTab', () => {
    it('returns the activeTab', (done) => {
        const activeTabIndex = 1;
        const testList = [{ test: 'data' }, { test: 'data2' }];

        expect(
            selectors.activeTab({
                tabs: {
                    activeTabIndex,
                    list: testList
                }
            } as any)
        ).toEqual({ test: 'data2' });
        done();
    });

    it('returns error-tab if state is corrupt', (done) => {
        expect(
            selectors.activeTab({
                tabs: {}
            } as any)
        ).toEqual(selectors.errorObject);
        done();
    });

    it('returns error-tab if an error is thrown', (done) => {
        expect(selectors.activeTab({} as any)).toEqual(selectors.errorObject);
        done();
    });
});

describe('noActiveTabs(): boolean', () => {
    it('returns true if there are no active tabs', (done) => {
        const testList: any = [];

        expect(
            selectors.noActiveTabs({
                tabs: {
                    list: testList
                }
            } as any)
        ).toBe(true);
        done();
    });

    it('returns false if there are active tabs', (done) => {
        const testList = [{ test: 'data' }, { test: 'data2' }];

        expect(
            selectors.noActiveTabs({
                tabs: {
                    list: testList
                }
            } as any)
        ).toBe(false);
        done();
    });
});
