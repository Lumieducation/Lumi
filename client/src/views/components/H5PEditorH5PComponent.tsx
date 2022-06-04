import React from 'react';
import i18next from 'i18next';

import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';

import Grid from '@material-ui/core/Grid';
import ContentPaper from './ContentPaper';

import { createStyles, Theme, withStyles } from '@material-ui/core/styles';

import { H5PPlayerUI, H5PEditorUI } from '@lumieducation/h5p-react';

import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import LoadingProgressBar from './LoadingProgressBar';
import { actions } from '../../state';

import { Modes } from '../../state/H5PEditor/H5PEditorTypes';
import { ITab } from '../../state/H5PEditor/H5PEditorTypes';

declare var window: any;

function a11yProps(index: any): { 'aria-controls': string; id: string } {
    return {
        'aria-controls': `vertical-tabpanel-${index}`,
        id: `vertical-tab-${index}`
    };
}

interface IH5PEditorH5PComponent {
    tab: ITab;
    show: boolean;

    classes: any;

    updateTab: typeof actions.h5peditor.updateTab;

    loadPlayerContent: typeof actions.h5peditor.loadPlayerContent;
    loadEditorContent: typeof actions.h5peditor.loadEditorContent;
    updateContent: typeof actions.h5peditor.updateContent;

    editorLoaded: typeof actions.h5peditor.editorLoaded;
    editorSaved: typeof actions.h5peditor.editorSaved;
    editorSaveError: typeof actions.h5peditor.editorSaveError;
    playerInitialized: typeof actions.h5peditor.playerInitialized;
}

export class H5PEditorH5PComponent extends React.Component<IH5PEditorH5PComponent> {
    constructor(props: IH5PEditorH5PComponent) {
        super(props);

        this.h5pEditor = React.createRef<H5PEditorUI>();
    }

    private h5pEditor: any; // React.RefObject<H5PEditorUI>;

    public componentDidUpdate(prevProps: any) {
        if (this.props.show) {
            window.h5peditor = this.h5pEditor;
        }
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
                                <span>
                                    {i18next.t('editor.tab.view') as string}
                                </span>
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
                                <span>
                                    {i18next.t('editor.tab.edit') as string}
                                </span>
                            </div>
                        }
                        {...a11yProps(1)}
                    />
                </Tabs>
                {this.props.tab.loadingIndicator ? (
                    <LoadingProgressBar />
                ) : null}

                <Grid>
                    <ContentPaper>
                        <div
                            style={{
                                display:
                                    this.props.tab.mode === Modes.edit
                                        ? 'block'
                                        : 'none'
                            }}
                        >
                            <H5PEditorUI
                                ref={this.h5pEditor}
                                contentId={this.props.tab.contentId ?? 'new'}
                                loadContentCallback={this.loadEditorContent}
                                saveContentCallback={this.updateEditorContent}
                                onLoaded={this.editorLoaded}
                                onSaved={this.editorSaved}
                                onSaveError={this.editorSaveError}
                            />
                        </div>
                        <div>
                            {this.props.tab.mode === Modes.view &&
                            this.props.tab.contentId ? (
                                <H5PPlayerUI
                                    contentId={this.props.tab.contentId}
                                    loadContentCallback={this.loadPlayerContent}
                                    onInitialized={this.playerInitialized}
                                />
                            ) : null}
                        </div>
                    </ContentPaper>
                </Grid>
            </div>
        );
    }

    private loadEditorContent = async (contentId: string) =>
        this.props.loadEditorContent(this.props.tab.id, contentId) as any;

    private updateEditorContent = async (
        contentId: string,
        requestBody: { library: string; params: any }
    ) =>
        this.props.updateContent(
            this.props.tab.id,
            contentId,
            requestBody
        ) as any;

    private loadPlayerContent = async (contentId: string) =>
        this.props.loadPlayerContent(contentId) as any;

    private changeMode = async (event: React.ChangeEvent<{}>, mode: number) => {
        try {
            if (mode === Modes.view) {
                if (await this.h5pEditor.current?.save()) {
                    this.props.updateTab(this.props.tab.id, {
                        mode
                    });
                }
            } else {
                this.props.updateTab(this.props.tab.id, {
                    mode
                });
            }
        } catch (error: any) {}
    };

    private editorSaved = () => {
        this.props.editorSaved(this.props.tab.id);
    };

    private editorLoaded = () => {
        this.props.editorLoaded(this.props.tab.id);
    };

    private editorSaveError = (message: string) => {
        this.props.editorSaveError(this.props.tab.id, message);
    };

    private playerInitialized = () => {
        this.props.playerInitialized(this.props.tab.id);
    };
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
