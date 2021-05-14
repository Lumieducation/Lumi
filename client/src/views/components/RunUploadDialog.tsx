import React from 'react';

import { useTranslation } from 'react-i18next';

import {
    createStyles,
    Theme,
    withStyles,
    WithStyles
} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import LinearProgress from '@material-ui/core/LinearProgress';

import RunLink from './RunLink';

type uploadProgressStates =
    | 'not_started'
    | 'pending'
    | 'success'
    | 'error'
    | 'processing';

const styles = (theme: Theme) =>
    createStyles({
        root: {
            margin: 0,
            minWidth: 400,
            padding: theme.spacing(2)
        },
        closeButton: {
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500]
        },
        link: {
            minWidth: '280px'
        }
    });

export interface DialogTitleProps extends WithStyles<typeof styles> {
    id: string;
    children: React.ReactNode;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
    const { children, classes, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h6">{children}</Typography>
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(2)
    }
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1)
    }
}))(MuiDialogActions);

export default function RunUploadDialog(props: {
    open: boolean;
    uploadProgress: {
        runId?: string;
        state: uploadProgressStates;
        progress: number;
    };
    goToRun: () => void;
    onCopy: (runId: string) => void;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const { open, uploadProgress, goToRun, onCopy, onClose } = props;

    return (
        <Dialog aria-labelledby="customized-dialog-title" open={open}>
            <DialogTitle id="run-upload-dialog-title">Lumi Run</DialogTitle>
            <DialogContent dividers>
                {uploadProgress.runId && (
                    <div>
                        {t('run.uploadDialog.success')}
                        <List>
                            <ListItem>
                                <RunLink
                                    runId={uploadProgress.runId}
                                    onCopy={onCopy}
                                />
                            </ListItem>
                        </List>
                    </div>
                )}
                {uploadProgress.progress !== 100 && (
                    <div>
                        {t('run.uploadDialog.uploading')}
                        <LinearProgress
                            variant="determinate"
                            value={uploadProgress.progress}
                        />
                    </div>
                )}
                {uploadProgress.progress === 100 && !uploadProgress.runId && (
                    <div>
                        {t('run.uploadDialog.processing')}
                        <LinearProgress variant="indeterminate" />
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={goToRun}
                    autoFocus
                    color="secondary"
                    disabled={
                        uploadProgress.state === 'pending' ||
                        uploadProgress.state === 'processing'
                    }
                >
                    {t('run.uploadDialog.goToRun')}
                </Button>

                <Button
                    onClick={onClose}
                    autoFocus
                    disabled={
                        uploadProgress.state === 'pending' ||
                        uploadProgress.state === 'processing'
                    }
                    color="primary"
                >
                    {t('run.uploadDialog.ok')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
