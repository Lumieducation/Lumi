import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Logger from 'client/helpers/Logger';

import CssBaseline from '@material-ui/core/CssBaseline';

import AppBar from './AppBar';
import EditorStartPage from 'components/EditorStartPage';
import ErrorBoundary from 'components/ErrorBoundary';
import Main from 'components/Main';
import Root from 'components/Root';

import LeftDrawer from './LeftDrawer';
import H5P from './H5P';
import Settings from './Settings';

import { actions, IState, selectors } from '../../state';

import { ITab } from 'state/tabs/types';

const log = new Logger('container:app');

interface IPassedProps {}

interface IStateProps extends IPassedProps {
    activeTab: ITab;
    leftDrawerOpen: boolean;
    noActiveTabs: boolean;
}

interface IDispatchProps {
    closeLeftDrawer: typeof actions.ui.closeLeftDrawer;
    createH5P: typeof actions.core.clickOnCreateH5P;
    openFiles: typeof actions.core.openH5P;
    openLeftDrawer: typeof actions.ui.openLeftDrawer;
}

interface IComponentState {}

interface IProps extends IStateProps, IDispatchProps {}

export class EditorContainer extends React.Component<IProps, IComponentState> {
    constructor(props: IProps) {
        super(props);

        this.state = {};

        this.closeLeftDrawer = this.closeLeftDrawer.bind(this);
        this.createH5P = this.createH5P.bind(this);
        this.openLeftDrawer = this.openLeftDrawer.bind(this);
        this.openFiles = this.openFiles.bind(this);
    }

    public closeLeftDrawer(): void {
        log.info(`closing left-drawer`);
        this.props.closeLeftDrawer();
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
                            closeLeftDrawer={this.closeLeftDrawer}
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
                                    <H5P key={activeTab.id} />
                                </div>
                            )}
                        </ErrorBoundary>
                    </Main>
                    <Settings />
                </Root>
            </div>
        );
    }

    private createH5P(): void {
        this.props.createH5P();
    }
}

function mapStateToProps(state: IState, ownProps: IPassedProps): IStateProps {
    return {
        activeTab: selectors.tabs.activeTab(state),
        leftDrawerOpen: selectors.ui.leftDrawerOpen(state),
        noActiveTabs: selectors.tabs.noActiveTabs(state)
    };
}

function mapDispatchToProps(dispatch: any): IDispatchProps {
    return bindActionCreators(
        {
            closeLeftDrawer: actions.ui.closeLeftDrawer,
            createH5P: actions.core.clickOnCreateH5P,
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
