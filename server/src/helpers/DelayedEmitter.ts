import SocketIO from 'socket.io';
import log from 'electron-log';

import SettingsCache from '../config/SettingsCache';

/**
 * Wraps around SocketIO.Server and queues events until the websocket connection
 * to the client is established. Events sent after the connection is established
 * are sent directly without delay.
 */
export default class DelayedEmitter {
    constructor(
        private settingsCache: SettingsCache,
        private websocketServer?: SocketIO.Server
    ) {
        log.debug(`DelayedEmitter: Initialized`);
        if (this.websocketServer) {
            this.websocketServer.on('connection', this.onConnection);
        }
        settingsCache.subscribe(this.onSettingsChanged);
    }

    private eventQueue: {
        /**
         * The arguments of the event.
         */
        args: any[];
        /**
         * The name of the event.
         */
        name: string;
    }[] = [];

    /**
     * Keeps track if the user has consented to the privacy policy.
     */
    private hasConsented: boolean = false;

    /**
     * Keeps track if the Websocket is connected to the client.
     */
    private isConnected: boolean = false;

    /**
     * Queues the event or emits it directly, depending on whether the websocket
     * is already connected.
     * @param name the name of the event
     * @param args the custom arguments to pass alongside the event name
     */
    public emit = (name: string, ...args: any[]): void => {
        if (this.isConnected && this.hasConsented) {
            log.debug(`DelayedEmitter: Immediately emitting event "${name}"`);
            this.websocketServer.emit(name, ...args);
        } else {
            log.debug(`DelayedEmitter: Queueing event "${name}"`);
            this.eventQueue.push({ name, args });
        }
    };

    /**
     * Sets the connection state to false again and listens for a new connection.
     */
    public resetWebsocketConnection = (): void => {
        log.debug(
            `DelayedEmitter: Resetting websocket connected state and waiting for new connection event`
        );
        this.isConnected = false;
        this.websocketServer.on('connection', this.onConnection);
    };

    public setWebsocket = (websocket: SocketIO.Server): void => {
        log.debug(`DelayedEmitter: Set websocket`);
        this.websocketServer = websocket;
        this.websocketServer.on('connection', this.onConnection);
    };

    private emitQueue = (): void => {
        log.debug('DelayedEmitter: Emitting queued events');
        for (const event of this.eventQueue) {
            log.debug(
                `Event: ${event.name}, args: ${JSON.stringify(event.args)}`
            );
            this.websocketServer.emit(event.name, ...event.args);
        }
        this.eventQueue = [];
    };

    private onConnection = (): void => {
        log.debug('DelayedEmitter: Websocket connected');
        this.isConnected = true;
        if (this.hasConsented) {
            this.emitQueue();
        }
    };

    private onSettingsChanged = (): void => {
        if (this.settingsCache.getSettingsSync().privacyPolicyConsent) {
            log.debug('DelayedEmitter: User has consented to privacy policy');
            this.hasConsented = true;
            this.settingsCache.unsubscribe(this.onSettingsChanged);
            if (this.isConnected) {
                this.emitQueue();
            }
        }
    };
}
