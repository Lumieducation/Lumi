import { default as reducer, initialState } from '../reducer';
import {
    UPDATE_DOWNLOADED,
    UPDATE_AVAILABLE,
    UPDATE_ERROR,
    UPDATE_CHECKING_FOR_UPDATE,
    UPDATE_NOT_AVAILABLE,
    UPDATE_PROGRESS
} from '../types';

describe('initialState', () => {
    it('returns the initial state', done => {
        const state = reducer(undefined, {
            type: 'init'
        } as any);

        expect(state).toEqual(initialState);
        done();
    });
});

describe('UPDATE_DOWNLOADED', () => {
    it('updates the state', done => {
        const state = reducer({ checking_for_updates: true } as any, {
            payload: {
                info: {
                    files: [],
                    releaseDate: 'now',
                    releaseName: 'test',
                    releaseNotes: 'abc',
                    version: '1.2.3'
                }
            },
            type: UPDATE_DOWNLOADED
        });

        expect(state.update_info?.releaseName).toBe('test');
        expect(state.checking_for_updates).toBe(false);
        expect(state.update_downloaded).toBe(true);
        done();
    });
});

describe('UPDATE_AVAILABLE', () => {
    it('updates the state', done => {
        const state = reducer({ checking_for_updates: true } as any, {
            payload: {
                info: {
                    files: [],
                    releaseDate: 'now',
                    releaseName: 'test',
                    releaseNotes: 'abc',
                    version: '1.2.3'
                }
            },
            type: UPDATE_AVAILABLE
        });

        expect(state.update_info?.releaseName).toBe('test');
        expect(state.checking_for_updates).toBe(false);
        expect(state.update_available).toBe(true);
        done();
    });
});

describe('UPDATE_AVAILABLE', () => {
    it('updates the state', done => {
        const state = reducer({ checking_for_updates: true } as any, {
            payload: {
                info: {
                    files: [],
                    releaseDate: 'now',
                    releaseName: 'test',
                    releaseNotes: 'abc',
                    version: '1.2.3'
                }
            },
            type: UPDATE_AVAILABLE
        });

        expect(state.update_info?.releaseName).toBe('test');
        expect(state.checking_for_updates).toBe(false);
        expect(state.update_available).toBe(true);
        done();
    });
});

describe('UPDATE_ERROR', () => {
    it('updates the state', done => {
        const state = reducer({ checking_for_updates: true } as any, {
            payload: {
                error: 'test'
            },
            type: UPDATE_ERROR
        });

        expect(state.checking_for_updates).toBe(false);
        expect(state.error).toBe('test');
        done();
    });
});

describe('UPDATE_CHECKING_FOR_UPDATE', () => {
    it('updates the state', done => {
        const state = reducer({ checking_for_updates: true } as any, {
            payload: {},
            type: UPDATE_CHECKING_FOR_UPDATE
        });

        expect(state.checking_for_updates).toBe(true);
        done();
    });
});

describe('UPDATE_NOT_AVAILABLE', () => {
    it('updates the state', done => {
        const state = reducer(
            {
                checking_for_updates: true
            } as any,
            {
                payload: {},
                type: UPDATE_NOT_AVAILABLE
            }
        );

        expect(state.update_available).toBe(false);
        expect(state.checking_for_updates).toBe(false);
        done();
    });
});

describe('UPDATE_PROGRESS', () => {
    it('updates the state', done => {
        const state = reducer(
            {
                checking_for_updates: true
            } as any,
            {
                payload: {
                    bytesPerSecond: 1337,
                    percent: 95,
                    progress: 'p',
                    total: 'tt',
                    transferred: 't'
                },
                type: UPDATE_PROGRESS
            }
        );

        expect(state.checking_for_updates).toBe(false);
        expect(state.update_progress?.percent).toBe(95);
        done();
    });
});
