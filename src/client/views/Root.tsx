import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Logger from '../helpers/Logger';

import CssBaseline from '@material-ui/core/CssBaseline';

import AppBar from 'lib/components/AppBar';
import EditorStartPage from 'lib/components/EditorStartPage';
import ErrorBoundary from 'lib/components/ErrorBoundary';
import Main from 'lib/components/Main';
import Root from 'lib/components/Root';

import LeftDrawer from './LeftDrawer';
import Tab from './Tab';
import Tabs from './Tabs';

import { actions, IState, selectors } from '../state';

import { ITab } from 'lib/tabs/types';

const log = new Logger('container:app');

interface IPassedProps {}

interface IStateProps extends IPassedProps {
    activeTab: ITab;
    currentDirectory: string;
    leftDrawerOpen: boolean;
    noActiveTabs: boolean;
    root?: string;
}

interface IDispatchProps {
    createDirectory: typeof actions.core.filetreeCreateDirectory;
    createFile: typeof actions.core.filetreeCreateFile;
    createH5P: typeof actions.core.clickOnCreateH5P;
    getFileTree: typeof actions.fileTree.getFileTree;
    openFiles: typeof actions.core.openH5P;
    openLeftDrawer: typeof actions.ui.openLeftDrawer;
}

interface IComponentState {}

interface IProps extends IStateProps, IDispatchProps {}

export class EditorContainer extends React.Component<IProps, IComponentState> {
    constructor(props: IProps) {
        super(props);

        this.state = {};

        this.openLeftDrawer = this.openLeftDrawer.bind(this);
        this.openFiles = this.openFiles.bind(this);
        this.createDirectory = this.createDirectory.bind(this);
        this.createFile = this.createFile.bind(this);
        this.createH5P = this.createH5P.bind(this);
        this.refresh = this.refresh.bind(this);
    }

    public openFiles(): void {
        this.props.openFiles();
    }

    public openLeftDrawer(): void {
        log.info(`opening left-drawer`);
        this.props.openLeftDrawer();
    }

    public render(): JSX.Element {
        log.info(`rendering`);

        const { activeTab, leftDrawerOpen, noActiveTabs } = this.props;
        return (
            <div id="editor">
                <Root>
                    <CssBaseline />
                    <ErrorBoundary>
                        <AppBar
                            leftDrawerOpen={leftDrawerOpen}
                            openLeftDrawer={this.openLeftDrawer}
                        />
                    </ErrorBoundary>
                    <ErrorBoundary>
                        <LeftDrawer />
                    </ErrorBoundary>
                    <Main leftDrawerOpen={leftDrawerOpen}>
                        <ErrorBoundary>
                            {noActiveTabs ? (
                                <EditorStartPage
                                    primaryButtonClick={this.openFiles}
                                    secondaryButtonClick={this.createH5P}
                                />
                            ) : (
                                <div>
                                    {/* <Tabs /> */}
                                    <Tab key={activeTab.id} />
                                </div>
                            )}
                        </ErrorBoundary>
                    </Main>
                </Root>
            </div>
        );
    }

    private createDirectory(path: string, name: string): void {
        this.props.createDirectory(path, name);
    }

    private createFile(path: string, name: string): void {
        this.props.createFile(path, name);
    }

    private createH5P(): void {
        this.props.createH5P();
    }

    private refresh(): void {
        this.props.getFileTree();
    }
}

function mapStateToProps(state: IState, ownProps: IPassedProps): IStateProps {
    return {
        activeTab: selectors.tabs.activeTab(state),
        currentDirectory: selectors.fileTree.currentDirectory(state),
        leftDrawerOpen: selectors.ui.leftDrawerOpen(state),
        noActiveTabs: selectors.tabs.noActiveTabs(state),
        root: selectors.fileTree.root(state)
    };
}

function mapDispatchToProps(dispatch: any): IDispatchProps {
    return bindActionCreators(
        {
            createDirectory: actions.core.filetreeCreateDirectory,
            createFile: actions.core.filetreeCreateFile,
            createH5P: actions.core.clickOnCreateH5P,
            getFileTree: actions.fileTree.getFileTree,
            openFiles: actions.core.openH5P,
            openLeftDrawer: actions.ui.openLeftDrawer
        },
        dispatch
    );
}

export default connect<IStateProps, IDispatchProps, IPassedProps, IState>(
    mapStateToProps,
    mapDispatchToProps
)(EditorContainer);
