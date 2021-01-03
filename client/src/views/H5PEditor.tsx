import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import MainSection from './components/MainSection';

import Root from './components/Root';

import { createStyles, Theme, withStyles } from '@material-ui/core/styles';

import H5PEditorOpenH5PSidebar from './components/H5PEditorOpenH5PSidebar';

import H5PEditorStartPage from './components/H5PEditorStartPage';

import H5PEditorH5PComponent from './components/H5PEditorH5PComponent';

import { actions, selectors } from '../state';

import { SaveButtonState } from '../state/H5PEditor/H5PEditorTypes';
import { ITab } from '../state/H5PEditor/H5PEditorTypes';

export class H5PEditor extends React.Component<{
    activeTab: ITab;
    tabs: ITab[];
    activeTabIndex: number;
    noActiveTab: boolean;
    saveButtonState: SaveButtonState;
    viewDisabled: boolean;

    classes: any;

    exportH5P: typeof actions.h5peditor.exportH5P;
    updateH5P: typeof actions.h5peditor.updateH5PInTab;
    updateTab: typeof actions.h5peditor.updateTab;

    loadPlayerContent: typeof actions.h5peditor.loadPlayerContent;
    loadEditorContent: typeof actions.h5peditor.loadEditorContent;
    saveContent: typeof actions.h5peditor.saveContent;

    editorLoaded: typeof actions.h5peditor.editorLoaded;
    editorSaved: typeof actions.h5peditor.editorSaved;
    editorSaveError: typeof actions.h5peditor.editorSaveError;
    playerInitialized: typeof actions.h5peditor.playerInitialized;

    closeTab: typeof actions.h5peditor.closeTab;
    createH5P: typeof actions.h5peditor.clickOnCreateH5P;
    openFiles: typeof actions.h5peditor.openH5P;
    selectTab: typeof actions.h5peditor.selectTab;
}> {
    public render(): React.ReactNode {
        if (this.props.noActiveTab) {
            return (
                <H5PEditorStartPage
                    primaryButtonClick={() => this.props.openFiles()}
                    secondaryButtonClick={() => this.props.createH5P()}
                />
            );
        }
        return (
            <div id="h5peditor">
                <Root>
                    <H5PEditorOpenH5PSidebar
                        tabs={this.props.tabs}
                        activeTabIndex={this.props.activeTabIndex}
                        create={() => this.props.createH5P()}
                        openFiles={() => this.props.openFiles()}
                        selectTab={(index: number) =>
                            this.props.selectTab(index)
                        }
                        closeTab={(index: number, id: string) =>
                            this.props.closeTab(id)
                        }
                    />
                    <MainSection>
                        {this.props.tabs.map((tab, index) => (
                            <H5PEditorH5PComponent
                                show={index === this.props.activeTabIndex}
                                key={tab.id}
                                tab={tab}
                                {...this.props}
                            />
                        ))}
                    </MainSection>
                </Root>
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
        saveButtonState: selectors.h5peditor.saveButtonState(state),
        viewDisabled: selectors.h5peditor.viewDisabled(state)
    };
}

function mapDispatchToProps(dispatch: any): any {
    return bindActionCreators(
        {
            exportH5P: actions.h5peditor.exportH5P,
            updateH5P: actions.h5peditor.updateH5PInTab,
            updateTab: actions.h5peditor.updateTab,

            loadPlayerContent: actions.h5peditor.loadPlayerContent,
            loadEditorContent: actions.h5peditor.loadEditorContent,
            saveContent: actions.h5peditor.saveContent,

            editorLoaded: actions.h5peditor.editorLoaded,
            editorSaved: actions.h5peditor.editorSaved,
            editorSaveError: actions.h5peditor.editorSaveError,
            playerInitialized: actions.h5peditor.playerInitialized,

            closeTab: actions.h5peditor.closeTab,
            createH5P: actions.h5peditor.clickOnCreateH5P,
            openFiles: actions.h5peditor.openH5P,
            selectTab: actions.h5peditor.selectTab
        },
        dispatch
    );
}

const styles = (theme: Theme) => createStyles({});

export default withStyles(styles)(
    connect(mapStateToProps, mapDispatchToProps)(H5PEditor)
);
