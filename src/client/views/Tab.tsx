import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Logger from '../helpers/Logger';

import Grid from '@material-ui/core/Grid';

import ContentPaper from 'lib/components/ContentPaper';
import ErrorBoundary from 'lib/components/ErrorBoundary';
import Loading from 'lib/components/LoadingPage';
import ModeTab from 'lib/components/ModeTab';
import SaveButton from 'lib/components/SaveButton';

import CreateFileDialog from 'lib/components/fs/CreateFileDialog';
import H5P from 'lib/components/H5P';

import { ITab } from 'lib/tabs/types';
import { Modes } from 'lib/ui/types';

import { actions, IState, selectors } from '../state';

import Editor from '../helpers/Editor';
import Target from '../helpers/Target';

import { track } from 'lib/track/actions';

const log = new Logger('container:tab');

interface IPassedProps {}

interface IStateProps extends IPassedProps {
    activeTab: ITab;
    currentDirectory: string;
    mode: Modes;
}

interface IDispatchProps {
    changeMode: typeof actions.ui.changeMode;
    exportH5P: typeof actions.core.clickOnSaveButton;
    updateH5P: typeof actions.core.updateH5PInTab;
    updateTab: typeof actions.tabs.updateTab;
}

interface IComponentState {
    showCreateFileDialog: boolean;
}

interface IProps extends IStateProps, IDispatchProps {}

export class TabContainer extends React.Component<IProps, IComponentState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            showCreateFileDialog: false
        };

        this.changeMode = this.changeMode.bind(this);
        this.clickOnSave = this.clickOnSave.bind(this);
        this.update = this.update.bind(this);
        this.exportH5P = this.exportH5P.bind(this);
    }

    private editorInterval: any;

    public componentDidMount(): void {
        this.editorInterval = setInterval(() => {
            try {
                log.info('checking for editor');
                const library = new Editor(
                    this.props.activeTab.id
                ).getLibrary();
                if (library !== '' && library) {
                    this.props.updateTab(this.props.activeTab.id, {
                        state: 'success'
                    });
                    clearInterval(this.editorInterval);
                }
            } catch (error) {
                log.error(error);
            }
        }, 500);
    }

    public componentWillUnmount(): void {
        if (this.props.activeTab.state !== 'closing') {
            this.update();
        }
        clearInterval(this.editorInterval);
    }

    public render(): JSX.Element {
        log.info(`rendering`);

        const { activeTab, currentDirectory, mode } = this.props;

        if (activeTab.loadingIndicator) {
            return <Loading />;
        }
        if (activeTab.state === 'error') {
            return <div>error</div>;
        }
        return (
            <div id="editor-tab">
                {activeTab.state !== 'opening' ? (
                    <ModeTab mode={mode} changeMode={this.changeMode} />
                ) : null}
                <div>
                    <Grid container={true} spacing={2}>
                        <Grid item={true} xs={10}>
                            <ErrorBoundary>
                                <ContentPaper>
                                    <H5P
                                        key={activeTab.contentId}
                                        contentId={activeTab.contentId}
                                        tabId={activeTab.id}
                                        mode={mode}
                                        update={(
                                            params: any,
                                            library: string
                                        ) => this.update()}
                                    />
                                </ContentPaper>
                            </ErrorBoundary>
                        </Grid>
                        <Grid item={true} xs={2} />
                    </Grid>
                </div>
                {activeTab.state !== 'opening' ? (
                    <SaveButton
                        onClick={this.clickOnSave}
                        state={(() => {
                            switch (activeTab.state) {
                                case 'saving':
                                    return 'pending';
                                case 'savingSuccess':
                                    return 'success';
                                case 'savingError':
                                    return 'error';
                                default:
                                    return undefined;
                            }
                        })()}
                    />
                ) : null}
                {this.state.showCreateFileDialog ? (
                    <CreateFileDialog
                        cancel={() =>
                            this.setState({ showCreateFileDialog: false })
                        }
                        type="file"
                        create={(name: string) => {
                            this.exportH5P(`${currentDirectory}/${name}`);
                            this.setState({ showCreateFileDialog: false });
                        }}
                        path={currentDirectory}
                    />
                ) : null}
            </div>
        );
    }

    private changeMode(mode: Modes): void {
        track('tab', 'click', 'change_mode');
        this.update()
            .then(() => {
                this.props.changeMode(mode);
            })
            .catch(error => {
                log.error(error);
            });
    }

    private clickOnSave(): void {
        const { activeTab } = this.props;
        if (!activeTab.path && Target.get() === 'platform') {
            this.setState({ showCreateFileDialog: true });
        } else {
            this.exportH5P(activeTab.path);
        }
    }

    private exportH5P(path?: string): void {
        const { activeTab, exportH5P } = this.props;
        const editor = new Editor(this.props.activeTab.id);
        exportH5P(
            activeTab.id,
            editor.getParams(),
            editor.getLibrary(),
            activeTab.contentId,
            path
        );
    }

    private update(): Promise<any> {
        const { activeTab, updateH5P } = this.props;
        log.info(`updating ${activeTab.contentId} in tab ${activeTab.id}`);

        try {
            const editor = new Editor(activeTab.id);
            return updateH5P(
                activeTab.id,
                editor.getParams(),
                editor.getLibrary(),
                activeTab.contentId
            );
        } catch (error) {
            log.error(error);
            return Promise.reject(error);
        }
    }
}

function mapStateToProps(state: IState, ownProps: IPassedProps): IStateProps {
    return {
        activeTab: selectors.tabs.activeTab(state),
        currentDirectory: selectors.fileTree.currentDirectory(state),
        mode: selectors.ui.mode(state)
    };
}

function mapDispatchToProps(dispatch: any): IDispatchProps {
    return bindActionCreators(
        {
            changeMode: actions.ui.changeMode,
            exportH5P: actions.core.clickOnSaveButton,
            updateH5P: actions.core.updateH5PInTab,
            updateTab: actions.tabs.updateTab
        },
        dispatch
    );
}

export default connect<IStateProps, IDispatchProps, IPassedProps, IState>(
    mapStateToProps,
    mapDispatchToProps
)(TabContainer);
