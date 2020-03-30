import { INotification, NotificationTypes } from './types';

export default class Notification implements INotification {
    constructor(key: string, message: string, variant: NotificationTypes) {
        this.key = key;
        this.message = message;
        this.options = { variant };
    }

    public key: string;
    public message: string;
    public options: {
        variant: NotificationTypes;
    };
}
