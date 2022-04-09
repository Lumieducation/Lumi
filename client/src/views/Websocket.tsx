import React from 'react';
import { connect } from 'react-redux';
import * as Sentry from '@sentry/browser';
import SocketIOClient from 'socket.io-client';
import Logger from '../helpers/Logger';
import { ITab } from '../state/H5PEditor/H5PEditorTypes';
import { actions, IState, selectors } from '../state';
import { NavigateFunction } from 'react-router-dom';

const log = new Logger('container:websocket');

interface IPassedProps {}

interface IStateProps extends IPassedProps {
    activeTab: ITab;
    lockDisplay: boolean;
}

interface IDispatchProps {
    dispatch: (action: any) => void;
}

interface IComponentState {}

interface IProps extends IStateProps, IDispatchProps {}

declare var window: {
    navigate: NavigateFunction;
};

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

        this.socket.on('error', (error: any) => {
            Sentry.captureException(error);
        });

        this.socket.on('action', (action: any) => {
            if (!this.props.lockDisplay) {
                switch (action.type) {
                    case 'action':
                        this.props.dispatch({
                            payload: action.payload.payload,
                            type: action.payload.type
                        });
                        break;

                    case 'IMPORT_ANALYTICS':
                        this.props.dispatch(
                            actions.analytics.importAnalytics()
                        );
                        break;

                    case 'NEW_H5P':
                        this.props.dispatch(actions.h5peditor.openTab());
                        break;

                    case 'OPEN_H5P':
                        action.payload.files.forEach(
                            (file: { fileHandleId: string; path: string }) => {
                                dispatch(
                                    actions.h5peditor.openH5P(
                                        file.fileHandleId,
                                        file.path,
                                        window.navigate
                                    )
                                );
                            }
                        );
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
                        dispatch(actions.h5peditor.openExportDialog());
                        break;

                    case 'UPLOAD_TO_RUN':
                        dispatch(
                            actions.run.upload({
                                contentId: this.props.activeTab.contentId
                            })
                        );
                        break;

                    case 'MESSAGE':
                        dispatch(
                            actions.notifications.notify(
                                action.payload.message,
                                action.payload.type
                            )
                        );
                }
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
            dispatch(actions.h5peditor.save());
        } catch (error: any) {
            Sentry.captureException(error);

            log.error(error);
        }
    }

    private async updateAndSave(): Promise<void> {
        try {
            const { activeTab, dispatch } = this.props;
            log.info(`saving ${activeTab.contentId}`);
            dispatch(actions.h5peditor.save(activeTab.fileHandleId));
        } catch (error: any) {
            Sentry.captureException(error);

            log.error(error);
        }
    }
}

function mapStateToProps(state: IState, ownProps: IPassedProps): IStateProps {
    return {
        activeTab: selectors.h5peditor.activeTab(state),
        lockDisplay: state.h5peditor.lockDisplay
    };
}

function mapDispatchToProps(dispatch: any): IDispatchProps {
    return { dispatch: (action: any) => dispatch(action) };
}

export default connect<IStateProps, IDispatchProps, IPassedProps, IState>(
    mapStateToProps,
    mapDispatchToProps
)(WebsocketContainer);
