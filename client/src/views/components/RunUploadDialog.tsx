import React from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
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
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import LinearProgress from '@material-ui/core/LinearProgress';

import DoneIcon from '@material-ui/icons/Done';

import ErrorIcon from '@material-ui/icons/Error';
import { actions, IState } from '../../state';
import CircularProgress, {
    CircularProgressProps
} from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import RunLink from './RunLink';

// import { Link, useHistory } from 'react-router-dom';

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
    onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
    const { children, classes, onClose, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton
                    aria-label="close"
                    className={classes.closeButton}
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
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

export default function CustomizedDialogs() {
    const showDialog = useSelector(
        (state: IState) => state.run.showUploadDialog
    );
    const uploadProgress = useSelector(
        (state: IState) => state.run.uploadProgress
    );
    const history = useHistory();
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const goToRun = () => {
        dispatch(actions.run.updateState({ showUploadDialog: false }));
        history.push('/run');
    };

    return (
        <Dialog
            onClose={() =>
                dispatch(
                    actions.run.updateState({
                        showUploadDialog: false
                    })
                )
            }
            aria-labelledby="customized-dialog-title"
            open={showDialog}
        >
            <DialogTitle
                id="customized-dialog-title"
                onClose={() =>
                    dispatch(
                        actions.run.updateState({
                            showUploadDialog: false
                        })
                    )
                }
            >
                Lumi Run
            </DialogTitle>
            <DialogContent dividers>
                {uploadProgress.id && (
                    <div>
                        {t('run.upload_dialog.success')}
                        <List>
                            <ListItem>
                                <RunLink id={uploadProgress.id} />
                            </ListItem>
                        </List>
                    </div>
                )}
                {uploadProgress.progress !== 100 && (
                    <div>
                        {t('run.upload_dialog.uploading')}
                        <LinearProgress
                            variant="determinate"
                            value={uploadProgress.progress}
                        />
                    </div>
                )}
                {uploadProgress.progress === 100 && !uploadProgress.id && (
                    <div>
                        {t('run.upload_dialog.processing')}
                        <LinearProgress variant="indeterminate" />
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={goToRun} autoFocus color="secondary">
                    {t('run.upload_dialog.buttons.go_to_run')}
                </Button>

                <Button
                    onClick={() =>
                        dispatch(
                            actions.run.updateState({
                                showUploadDialog: false
                            })
                        )
                    }
                    autoFocus
                    color="primary"
                >
                    {t('run.upload_dialog.buttons.ok')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
