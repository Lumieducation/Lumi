import SocketIO from 'socket.io';
import log from 'electron-log';

export default class DelayedEmitter {
    constructor(private websocket?: SocketIO.Server) {
        log.debug(`DelayedEmitter: Initialized"`);
        if (this.websocket) {
            this.websocket.on('connection', this.onConnection);
        }
    }

    private eventQueue: {
        data: any;
        name: string;
    }[] = [];
    private isConnected: boolean = false;

    public emit = (name: string, data: any): void => {
        if (this.isConnected) {
            log.debug(`DelayedEmitter: Immediately emitting event "${name}"`);
            this.websocket.emit(name, data);
        } else {
            log.debug(`DelayedEmitter: Queueing event "${name}"`);
            this.eventQueue.push({ name, data });
        }
    };
    
    public setWebsocket = (websocket: SocketIO.Server): void => {
        log.debug(`DelayedEmitter: Set websocket`);
        this.websocket = websocket;
        this.websocket.on('connection', this.onConnection);
    };

    private emitQueue = (): void => {
        log.debug('DelayedEmitter: Emitting queued events');
        for (const event of this.eventQueue) {
            this.websocket.emit(event.name, event.data);
        }
        this.eventQueue = [];
    };

    private onConnection = () => {
        log.debug('DelayedEmitter: Websocket connected');
        this.isConnected = true;
        this.emitQueue();
    };
}
