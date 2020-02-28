import React from 'react';
import { connect } from 'react-redux';

import * as Sentry from '@sentry/browser';

import SocketIOClient from 'socket.io-client';

import Logger from '../helpers/Logger';

import { ITab } from 'lib/tabs/types';

import { actions, IState, selectors } from '../state';

import Editor from '../helpers/Editor';

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

        this.socket = SocketIOClient(
            `${window.location.protocol}//${window.location.hostname}${
                process.env.NODE_ENV === 'development'
                    ? ':3002'
                    : `:${window.location.port}`
            }`
        );

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
                    this.props.dispatch(actions.core.clickOnCreateH5P());
                    break;

                case 'OPEN_FOLDER':
                    dispatch(
                        actions.fileTree.updateFileTreeRoot(action.payload.path)
                    );
                    dispatch(actions.fileTree.getFileTree(action.payload.path));
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

    private saveAs(): void {
        try {
            const { activeTab, dispatch } = this.props;
            log.info(`saving ${activeTab.contentId}`);
            if (activeTab.state === 'success') {
                dispatch(
                    actions.core.clickOnSaveButton(
                        activeTab.id,
                        new Editor(activeTab.id).getParams(),
                        new Editor(activeTab.id).getLibrary(),
                        activeTab.contentId
                    )
                );
            }
        } catch (error) {
            log.error(error);
        }
    }

    private updateAndSave(): void {
        try {
            const { activeTab, dispatch } = this.props;
            log.info(`saving ${activeTab.contentId}`);
            if (activeTab.state === 'success') {
                dispatch(
                    actions.core.clickOnSaveButton(
                        activeTab.id,
                        new Editor(activeTab.id).getParams(),
                        new Editor(activeTab.id).getLibrary(),
                        activeTab.contentId,
                        activeTab.path
                    )
                );
            }
        } catch (error) {
            log.error(error);
        }
    }
}

function mapStateToProps(state: IState, ownProps: IPassedProps): IStateProps {
    return {
        activeTab: selectors.tabs.activeTab(state)
    };
}

function mapDispatchToProps(dispatch: any): IDispatchProps {
    return { dispatch: (action: any) => dispatch(action) };
}

export default connect<IStateProps, IDispatchProps, IPassedProps, IState>(
    mapStateToProps,
    mapDispatchToProps
)(WebsocketContainer);
