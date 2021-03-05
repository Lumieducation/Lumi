import React from 'react';

import { useSelector } from 'react-redux';

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
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Switch from '@material-ui/core/Switch';
import WifiIcon from '@material-ui/icons/Wifi';
import BluetoothIcon from '@material-ui/icons/Bluetooth';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CodeIcon from '@material-ui/icons/Code';
import DoneIcon from '@material-ui/icons/Done';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import ErrorIcon from '@material-ui/icons/Error';
import { IState } from '../../state';
import CircularProgress, {
    CircularProgressProps
} from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';

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
    const showDialog = useSelector((state: IState) => state.run.showDialog);
    const uploadProgress = useSelector(
        (state: IState) => state.run.uploadProgress
    );

    return (
        <Dialog
            onClose={() => console.log('no')}
            aria-labelledby="customized-dialog-title"
            open={showDialog}
        >
            <DialogTitle
                id="customized-dialog-title"
                onClose={() => console.log('no')}
            >
                Lumi Run
            </DialogTitle>
            <DialogContent dividers>
                <List>
                    <ListItem>
                        <ListItemIcon>
                            <ImportExportIcon />
                        </ListItemIcon>
                        <ListItemText
                            id="switch-list-label-wifi"
                            primary="Importing & validating H5P"
                        />
                        <ListItemSecondaryAction>
                            {uploadStateIcon(uploadProgress.import.state)}
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <CodeIcon />
                        </ListItemIcon>
                        <ListItemText
                            id="switch-list-label-wifi"
                            primary="Exporting H5P as HTML"
                        />
                        <ListItemSecondaryAction>
                            {uploadStateIcon(uploadProgress.export.state)}
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <CloudUploadIcon />
                        </ListItemIcon>
                        <ListItemText
                            id="switch-list-label-bluetooth"
                            primary="Uploading to Lumi.run"
                        />
                        <ListItemSecondaryAction>
                            {uploadStateIcon(
                                uploadProgress.upload.state,
                                uploadProgress.upload.progress
                            )}
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            </DialogContent>
            <DialogActions>
                <Button autoFocus color="secondary">
                    Go to Run
                </Button>
                <Button autoFocus color="primary">
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function uploadStateIcon(
    state: 'not_started' | 'pending' | 'success' | 'error',
    progress?: number
): JSX.Element {
    switch (state) {
        default:
        case 'not_started':
            return <div></div>;
        case 'pending':
            return progress ? (
                <CircularProgressWithLabel value={progress} />
            ) : (
                <CircularProgress />
            );
        case 'success':
            return (
                <IconButton>
                    <DoneIcon />
                </IconButton>
            );
        case 'error':
            return (
                <IconButton>
                    <ErrorIcon />
                </IconButton>
            );
    }
}

function CircularProgressWithLabel(
    props: CircularProgressProps & { value: number }
) {
    return (
        <Box position="relative" display="inline-flex">
            <CircularProgress variant="determinate" {...props} />
            <Box
                top={0}
                left={0}
                bottom={0}
                right={0}
                position="absolute"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Typography
                    variant="caption"
                    component="div"
                    color="textSecondary"
                >{`${Math.round(props.value)}%`}</Typography>
            </Box>
        </Box>
    );
}
