import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import MainSection from './components/MainSection';

import Root from './components/Root';

import { createStyles, Theme, withStyles } from '@material-ui/core/styles';

import H5PEditorOpenH5PSidebar from './components/H5PEditorOpenH5PSidebar';

import H5PEditorStartPage from './components/H5PEditorStartPage';

import H5PEditorH5PComponent from './components/H5PEditorH5PComponent';

import H5PEditorExportDialog from './components/H5PEditorExportDialog';
import LoadingPage from './components/LoadingPage';
import { actions, selectors } from '../state';

import { ITab } from '../state/H5PEditor/H5PEditorTypes';

export class H5PEditor extends React.Component<{
    activeTab: ITab;
    tabs: ITab[];
    activeTabIndex: number;
    noActiveTab: boolean;
    viewDisabled: boolean;

    classes: any;

    updateTab: typeof actions.h5peditor.updateTab;

    loadPlayerContent: typeof actions.h5peditor.loadPlayerContent;
    loadEditorContent: typeof actions.h5peditor.loadEditorContent;
    updateContent: typeof actions.h5peditor.updateContent;

    editorLoaded: typeof actions.h5peditor.editorLoaded;
    editorSaved: typeof actions.h5peditor.editorSaved;
    editorSaveError: typeof actions.h5peditor.editorSaveError;
    playerInitialized: typeof actions.h5peditor.playerInitialized;

    closeTab: typeof actions.h5peditor.closeTab;
    openTab: typeof actions.h5peditor.openTab;
    selectH5PAndOpen: typeof actions.h5peditor.selectH5PAndOpen;
    selectTab: typeof actions.h5peditor.selectTab;
}> {
    public render(): React.ReactNode {
        if (this.props.noActiveTab) {
            return (
                <div>
                    <H5PEditorStartPage
                        primaryButtonClick={() => this.props.selectH5PAndOpen()}
                        secondaryButtonClick={() => this.props.openTab()}
                    />
                </div>
            );
        }
        return (
            <div id="h5peditor">
                <Root>
                    <H5PEditorOpenH5PSidebar
                        tabs={this.props.tabs}
                        activeTabIndex={this.props.activeTabIndex}
                        create={() => this.props.openTab()}
                        openFiles={() => this.props.selectH5PAndOpen()}
                        selectTab={(index: number) =>
                            this.props.selectTab(index)
                        }
                        closeTab={(index: number, id: string) =>
                            this.props.closeTab(id)
                        }
                    />
                    <MainSection>
                        {this.props.tabs.map((tab, index) =>
                            tab.opening ? (
                                <div
                                    style={{
                                        display:
                                            index === this.props.activeTabIndex
                                                ? 'block'
                                                : 'none'
                                    }}
                                >
                                    <LoadingPage />
                                </div>
                            ) : (
                                <H5PEditorH5PComponent
                                    show={index === this.props.activeTabIndex}
                                    key={tab.id}
                                    tab={tab}
                                    {...this.props}
                                />
                            )
                        )}
                    </MainSection>
                </Root>
                <H5PEditorExportDialog />
            </div>
        );
    }
}

function mapStateToProps(state: any, ownProps: any): any {
    return {
        activeTab: selectors.h5peditor.activeTab(state),
        activeTabIndex: selectors.h5peditor.activeTabIndex(state),
        tabs: selectors.h5peditor.all(state),
        noActiveTab: selectors.h5peditor.noActiveTabs(state),
        viewDisabled: selectors.h5peditor.viewDisabled(state)
    };
}

function mapDispatchToProps(dispatch: any): any {
    return bindActionCreators(
        {
            updateTab: actions.h5peditor.updateTab,

            loadPlayerContent: actions.h5peditor.loadPlayerContent,
            loadEditorContent: actions.h5peditor.loadEditorContent,
            updateContent: actions.h5peditor.updateContent,

            editorLoaded: actions.h5peditor.editorLoaded,
            editorSaved: actions.h5peditor.editorSaved,
            editorSaveError: actions.h5peditor.editorSaveError,
            playerInitialized: actions.h5peditor.playerInitialized,

            closeTab: actions.h5peditor.closeTab,
            openTab: actions.h5peditor.openTab,
            selectH5PAndOpen: actions.h5peditor.selectH5PAndOpen,
            selectTab: actions.h5peditor.selectTab
        },
        dispatch
    );
}

const styles = (theme: Theme) => createStyles({});

export default withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(H5PEditor)
);
