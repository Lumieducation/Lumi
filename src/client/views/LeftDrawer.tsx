import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Logger from '../helpers/Logger';

import LeftDrawer from 'components/LeftDrawer';

import OpenedH5PList from './OpenedH5PList';

import { actions, IState, selectors } from '../state';

const log = new Logger('container:app');

interface IPassedProps {}

interface IStateProps extends IPassedProps {
    currentDirectory: string;
    leftDrawerOpen: boolean;
    noActiveTabs: boolean;
    root?: string;
}

interface IDispatchProps {
    closeLeftDrawer: typeof actions.ui.closeLeftDrawer;
    createDirectory: typeof actions.core.filetreeCreateDirectory;
    createFile: typeof actions.core.filetreeCreateFile;
    getFileTree: typeof actions.fileTree.getFileTree;
    openLeftDrawer: typeof actions.ui.openLeftDrawer;
}

interface IComponentState {}

interface IProps extends IStateProps, IDispatchProps {}

export class LeftDrawerContainer extends React.Component<
    IProps,
    IComponentState
> {
    constructor(props: IProps) {
        super(props);

        this.state = {};

        this.closeLeftDrawer = this.closeLeftDrawer.bind(this);
        this.openLeftDrawer = this.openLeftDrawer.bind(this);
        this.createDirectory = this.createDirectory.bind(this);
        this.createFile = this.createFile.bind(this);
        this.refresh = this.refresh.bind(this);
    }

    public closeLeftDrawer(): void {
        log.info(`closing left-drawer`);
        this.props.closeLeftDrawer();
    }

    public openLeftDrawer(): void {
        log.info(`opening left-drawer`);
        this.props.openLeftDrawer();
    }

    public render(): JSX.Element {
        log.info(`rendering`);

        const { closeLeftDrawer, leftDrawerOpen } = this.props;
        return (
            <div id="editor-leftdrawer">
                <LeftDrawer
                    leftDrawerOpen={leftDrawerOpen}
                    closeLeftDrawer={closeLeftDrawer}
                >
                    <OpenedH5PList />
                </LeftDrawer>
            </div>
        );
    }

    private createDirectory(path: string, name: string): void {
        this.props.createDirectory(path, name);
    }

    private createFile(path: string, name: string): void {
        this.props.createFile(path, name);
    }

    private refresh(): void {
        this.props.getFileTree();
    }
}

function mapStateToProps(state: IState, ownProps: IPassedProps): IStateProps {
    return {
        currentDirectory: selectors.fileTree.currentDirectory(state),
        leftDrawerOpen: selectors.ui.leftDrawerOpen(state),
        noActiveTabs: selectors.tabs.noActiveTabs(state),
        root: selectors.fileTree.root(state)
    };
}

function mapDispatchToProps(dispatch: any): IDispatchProps {
    return bindActionCreators(
        {
            closeLeftDrawer: actions.ui.closeLeftDrawer,
            createDirectory: actions.core.filetreeCreateDirectory,
            createFile: actions.core.filetreeCreateFile,
            getFileTree: actions.fileTree.getFileTree,
            openLeftDrawer: actions.ui.openLeftDrawer
        },
        dispatch
    );
}

export default connect<IStateProps, IDispatchProps, IPassedProps, IState>(
    mapStateToProps,
    mapDispatchToProps
)(LeftDrawerContainer);
