import React from 'react';
import { connect } from 'react-redux';
import path from 'path';
import * as Sentry from '@sentry/browser';
import SocketIOClient from 'socket.io-client';
import upath from 'upath';

import Logger from '../helpers/Logger';
import { ITab } from '../state/H5PEditor/H5PEditorTypes';
import { actions, IState, selectors } from '../state';
// import Editor from '../helpers/Editor';

declare var window: any;

const log = new Logger('container:websocket');

interface IPassedProps {}

interface IStateProps extends IPassedProps {
    activeTab: ITab;
}

interface IDispatchProps {
    dispatch: (action: any) => void;
}

interface IComponentState {}

interface IProps extends IStateProps, IDispatchProps {}

export class WebsocketContainer extends React.Component<
    IProps,
    IComponentState
> {
    constructor(props: IProps) {
        super(props);

        this.state = {};

        this.socket = SocketIOClient();

        this.saveAs = this.saveAs.bind(this);
        this.updateAndSave = this.updateAndSave.bind(this);
    }

    private socket: SocketIOClient.Socket;

    public componentDidMount(): void {
        const { dispatch } = this.props;

        this.socket.on('connect', () => {
            log.info('connected');
        });

        this.socket.on('action', (action: any) => {
            switch (action.type) {
                case 'NEW_H5P':
                    this.props.dispatch(actions.h5peditor.openTab());
                    break;

                case 'OPEN_H5P':
                    action.payload.paths.forEach((file: any) => {
                        dispatch(
                            actions.h5peditor.clickOnFileInFiletree(
                                path.basename(upath.normalize(file)),
                                file
                            )
                        );
                    });
                    break;

                case 'SAVE':
                    this.updateAndSave();
                    break;

                case 'SAVE_AS':
                    this.saveAs();
                    break;

                case 'REPORT_ISSUE':
                    Sentry.showReportDialog();
                    break;

                case 'EXPORT_AS_HTML':
                    dispatch(actions.h5peditor.exportH5P());
                    break;

                case 'MESSAGE':
                    dispatch(
                        actions.notifications.notify(
                            action.payload.message,
                            action.payload.type
                        )
                    );
            }
        });
    }

    public render(): null {
        log.info(`rendering`);
        return null;
    }

    private async saveAs(): Promise<void> {
        try {
            const { activeTab, dispatch } = this.props;

            log.info(`saving ${activeTab.contentId}`);

            const data = await window.h5peditor.current?.save();

            if (data) {
                dispatch(actions.h5peditor.save(data.contentId));
            }
        } catch (error) {
            log.error(error);
        }
    }

    private async updateAndSave(): Promise<void> {
        try {
            const { activeTab, dispatch } = this.props;

            log.info(`saving ${activeTab.contentId}`);
            const data = await window.h5peditor.current?.save();

            if (data) {
                dispatch(
                    actions.h5peditor.save(data.contentId, activeTab.path)
                );
            }
        } catch (error) {
            log.error(error);
        }
    }
}

function mapStateToProps(state: IState, ownProps: IPassedProps): IStateProps {
    return {
        activeTab: selectors.h5peditor.activeTab(state)
    };
}

function mapDispatchToProps(dispatch: any): IDispatchProps {
    return { dispatch: (action: any) => dispatch(action) };
}

export default connect<IStateProps, IDispatchProps, IPassedProps, IState>(
    mapStateToProps,
    mapDispatchToProps
)(WebsocketContainer);
