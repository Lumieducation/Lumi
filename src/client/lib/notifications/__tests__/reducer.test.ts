import { default as reducer, initialState } from '../reducer';
import {
    CLOSE_SNACKBAR,
    ENQUEUE_SNACKBAR,
    INotification,
    REMOVE_SNACKBAR
} from '../types';

describe('initialState', () => {
    it('returns the initial state', done => {
        const state = reducer(undefined, { type: 'init' } as any);

        expect(state).toEqual(initialState);
        done();
    });
});

describe('ENQUEUE_SNACKBAR', () => {
    it('adds a new notification to the notifications-list', done => {
        const notification: INotification = {
            key: 'a',
            message: 'test',
            options: {
                variant: 'warning'
            }
        };

        const state = reducer(
            {
                notifications: []
            } as any,
            {
                notification,
                type: ENQUEUE_SNACKBAR
            }
        );

        expect(state.notifications.length).toBe(1);
        done();
    });
});

describe('CLOSE_SNACKBAR', () => {
    it('dismisses a notification', done => {
        const notification: INotification = {
            key: 'a',
            message: 'test',
            options: {
                variant: 'warning'
            }
        };

        const state = reducer(
            {
                notifications: [notification]
            } as any,
            {
                dismissAll: false,
                key: 'a',
                type: CLOSE_SNACKBAR
            }
        );

        expect(state.notifications[0].dismissed).toBeTruthy();
        done();
    });
});

describe('REMOVE_SNACKBAR', () => {
    it('removes a notification from the notifications-list', done => {
        const notification: INotification = {
            key: 'a',
            message: 'test',
            options: {
                variant: 'warning'
            }
        };

        const state = reducer(
            {
                notifications: [notification]
            } as any,
            {
                key: 'a',
                type: REMOVE_SNACKBAR
            }
        );

        expect(state.notifications.length).toBe(0);
        done();
    });
});
