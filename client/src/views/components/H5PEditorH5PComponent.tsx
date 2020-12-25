import React from 'react';

import { I18n } from 'react-redux-i18n';

import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';

import Grid from '@material-ui/core/Grid';
import ContentPaper from './ContentPaper';

import { createStyles, Theme, withStyles } from '@material-ui/core/styles';

import {
    defineElements,
    H5PEditorComponent,
    H5PPlayerComponent
} from 'h5p-webcomponents';

import SaveButton from './SaveButton';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import LoadingProgressBar from './LoadingProgressBar';
import { actions } from '../../state';

import { Modes } from '../../state/H5PEditor/H5PEditorTypes';
import { ITab } from '../../state/H5PEditor/H5PEditorTypes';

defineElements();

declare var window: any;

function a11yProps(index: any): { 'aria-controls': string; id: string } {
    return {
        'aria-controls': `vertical-tabpanel-${index}`,
        id: `vertical-tab-${index}`
    };
}

export class H5PEditorH5PComponent extends React.Component<{
    tab: ITab;
    show: boolean;

    classes: any;

    exportH5P: typeof actions.h5p.exportH5P;
    updateH5P: typeof actions.h5peditor.updateH5PInTab;
    updateTab: typeof actions.h5peditor.updateTab;

    loadPlayerContent: typeof actions.h5p.loadPlayerContent;
    loadEditorContent: typeof actions.h5p.loadEditorContent;
    saveContent: typeof actions.h5p.saveContent;

    editorLoaded: typeof actions.h5peditor.editorLoaded;
    editorSaved: typeof actions.h5peditor.editorSaved;
    editorSaveError: typeof actions.h5peditor.editorSaveError;
    playerInitialized: typeof actions.h5peditor.playerInitialized;
}> {
    constructor(props: {
        tab: ITab;
        show: boolean;

        classes: any;

        // changeMode: typeof actions.ui.changeMode;
        exportH5P: typeof actions.h5p.exportH5P;
        updateH5P: typeof actions.h5peditor.updateH5PInTab;
        updateTab: typeof actions.h5peditor.updateTab;

        loadPlayerContent: typeof actions.h5p.loadPlayerContent;
        loadEditorContent: typeof actions.h5p.loadEditorContent;
        saveContent: typeof actions.h5p.saveContent;

        editorLoaded: typeof actions.h5peditor.editorLoaded;
        editorSaved: typeof actions.h5peditor.editorSaved;
        editorSaveError: typeof actions.h5peditor.editorSaveError;
        playerInitialized: typeof actions.h5peditor.playerInitialized;
    }) {
        super(props);

        this.h5pEditor = React.createRef();
        this.h5pPlayer = React.createRef();
    }

    private h5pPlayer: React.RefObject<H5PPlayerComponent>;
    private h5pEditor: React.RefObject<H5PEditorComponent>;

    public componentDidMount() {
        this.registerEvents();
        this.setServiceCallbacks();
    }

    public getSnapshotBeforeUpdate() {
        // Should the old editor instance be destroyed, we unregister from it...
        this.unregisterEvents();

        return null;
    }

    public componentDidUpdate(prevProps: any) {
        if (
            prevProps.tab.id !== this.props.tab.id ||
            (prevProps.tab.mode !== this.props.tab.mode &&
                this.props.tab.mode === Modes.view)
        ) {
            this.registerEvents();
            this.setServiceCallbacks();
        }

        if (this.props.show) {
            window.h5peditor = this.h5pEditor;
        }
    }

    public componentWillUnmount() {
        this.unregisterEvents();
    }

    public render(): React.ReactNode {
        const { classes } = this.props;
        return (
            <div style={{ display: this.props.show ? 'block' : 'none' }}>
                <Tabs
                    value={this.props.tab.mode}
                    onChange={this.changeMode}
                    variant="fullWidth"
                    className={classes.modeTab}
                >
                    <Tab
                        label={
                            <div>
                                <VisibilityOutlinedIcon
                                    style={{ verticalAlign: 'middle' }}
                                />{' '}
                                {I18n.t('editor.tab.view')}
                            </div>
                        }
                        disabled={this.props.tab.viewDisabled}
                        {...a11yProps(0)}
                    />
                    <Tab
                        label={
                            <div>
                                <EditOutlinedIcon
                                    style={{ verticalAlign: 'middle' }}
                                />{' '}
                                {I18n.t('editor.tab.edit')}
                            </div>
                        }
                        {...a11yProps(1)}
                    />
                </Tabs>
                {this.props.tab.loadingIndicator ? (
                    <LoadingProgressBar />
                ) : null}

                <Grid style={{ marginRight: '72px' }}>
                    <ContentPaper>
                        <div
                            style={{
                                display:
                                    this.props.tab.mode === Modes.edit
                                        ? 'block'
                                        : 'none'
                            }}
                        >
                            <h5p-editor
                                ref={this.h5pEditor}
                                content-id={this.props.tab.contentId || 'new'}
                            ></h5p-editor>
                        </div>
                        <div
                            style={{
                                display:
                                    this.props.tab.mode === Modes.view
                                        ? 'block'
                                        : 'none'
                            }}
                        >
                            <h5p-player
                                ref={this.h5pPlayer}
                                content-id={this.props.tab.contentId}
                            ></h5p-player>
                        </div>
                    </ContentPaper>
                </Grid>
                <SaveButton
                    onClick={this.export}
                    state={this.props.tab.saveButtonState}
                />
            </div>
        );
    }

    private export = async () => {
        const data = await this.h5pEditor.current?.save();

        if (data) {
            this.props.exportH5P(data?.contentId || 'new', this.props.tab.path);
        }
    };

    private changeMode = async (event: React.ChangeEvent<{}>, mode: number) => {
        try {
            if (await this.h5pEditor.current?.save()) {
                this.props.updateTab(this.props.tab.id, {
                    mode
                });
            }
        } catch (error) {}
    };

    private editorSaved = () => {
        this.props.editorSaved(this.props.tab.id);
    };

    private editorLoaded = () => {
        this.props.editorLoaded(this.props.tab.id);
    };

    private editorSaveError = () => {
        this.props.editorSaveError(this.props.tab.id);
    };

    private playerInitialized = () => {
        this.props.playerInitialized(this.props.tab.id);
    };

    private registerEvents() {
        this.h5pEditor.current?.addEventListener('saved', this.editorSaved);
        this.h5pEditor.current?.addEventListener('editorloaded', () =>
            this.props.editorLoaded(this.props.tab.id)
        );
        this.h5pEditor.current?.addEventListener(
            'save-error',
            this.editorSaveError
        );

        this.h5pPlayer.current?.addEventListener(
            'initialized',
            this.playerInitialized
        );
    }

    private unregisterEvents() {
        this.h5pEditor.current?.removeEventListener('saved', this.editorSaved);
        this.h5pEditor.current?.removeEventListener(
            'editorloaded',
            this.editorLoaded
        );
        this.h5pEditor.current?.removeEventListener(
            'save-error',
            this.editorSaveError
        );

        this.h5pPlayer.current?.removeEventListener(
            'initialized',
            this.playerInitialized
        );
    }

    private setServiceCallbacks() {
        if (this.h5pEditor.current) {
            this.h5pEditor.current.loadContentCallback = async (
                contentId: string
            ) => {
                return (await this.props.loadEditorContent(contentId)) as any;
            };

            this.h5pEditor.current.saveContentCallback = (
                contentId: string,
                requestBody: { library: string; params: any }
            ) =>
                this.props.saveContent(
                    this.props.tab.id,
                    contentId,
                    requestBody
                ) as any;
        }
        if (this.h5pPlayer.current) {
            this.h5pPlayer.current.loadContentCallback = async (
                contentId: string
            ) => {
                return (await this.props.loadPlayerContent(contentId)) as any;
            };
        }
    }
}

const styles = (theme: Theme) =>
    createStyles({
        modeTab: {
            backgroundColor: theme.palette.background.paper,
            display: 'fixed',
            flexGrow: 1
        }
    });

export default withStyles(styles)(H5PEditorH5PComponent);
