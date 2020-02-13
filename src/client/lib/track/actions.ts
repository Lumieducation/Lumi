// import nucleus from 'nucleus-nodejs';

export function track(event: string, payload?: any): any {
    // nucleus.track(event, payload);

    return {
        payload: {
            event,
            payload
        },
        type: 'TRACK'
    };
}
