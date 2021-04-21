import i18next from 'i18next';
import SocketIO from 'socket.io';

const isMac = process.platform === 'darwin';

export default function (websocket: SocketIO.Server): any {
    return {
        label: i18next.t('lumi:menu.run.label'),
        submenu: [
            {
                label: i18next.t('lumi:menu.run.upload'),
                click: () => {
                    websocket.emit('action', {
                        payload: {},
                        type: 'UPLOAD_TO_RUN'
                    });
                }
            }
        ]
    };
}
