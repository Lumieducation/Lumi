import React from 'react';
import { useTranslation } from 'react-i18next';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Divider from '@material-ui/core/Divider';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import H5PAvatar from './H5PAvatar';
import ListSubheader from '@material-ui/core/ListSubheader';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import DeleteIcon from '@material-ui/icons/Delete';

import RunLink from './RunLink';

export interface IRun {
    runId: string;
    title: string;
    mainLibrary: string;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            marginTop: '64px',
            backgroundColor: theme.palette.background.paper
        },
        link: {
            minWidth: '280px'
        },
        center: {
            margin: 'auto'
        }
    })
);

export default function RunList(props: {
    runs: IRun[];
    onDelete: (runId: string) => void;
    onCopy: (runId: string) => void;
}) {
    const classes = useStyles();
    const { t } = useTranslation();
    const { runs } = props;

    const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
    const [runIdToDelete, setRunIdToDelete] = React.useState('');

    return (
        <div>
            <List
                subheader={
                    <ListSubheader>{t('run.list.header')}</ListSubheader>
                }
                className={classes.root}
            >
                {runs.length === 0 && (
                    <ListItem>
                        <ListItemText
                            primary={t('run.list.noUploadedH5P')}
                        ></ListItemText>
                    </ListItem>
                )}
                {runs.map((run) => (
                    <div key={run.runId}>
                        <Divider variant="inset" component="li" />

                        <ListItem>
                            <ListItemAvatar>
                                <H5PAvatar mainLibrary={run.mainLibrary} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={run.title}
                                secondary={run.runId}
                            />
                            <div className={classes.center}>
                                <RunLink runId={run.runId} {...props} />
                            </div>
                            <ListItemSecondaryAction>
                                <IconButton
                                    onClick={() => {
                                        setRunIdToDelete(run.runId);
                                        setShowDeleteDialog(true);
                                    }}
                                    edge="end"
                                    aria-label="delete"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    </div>
                ))}
            </List>

            <Dialog
                open={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {t('run.list.deleteDialog.title', { runId: runIdToDelete })}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {t('run.list.deleteDialog.description', {
                            runId: runIdToDelete
                        })}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setShowDeleteDialog(false)}
                        color="primary"
                    >
                        {t('run.list.deleteDialog.cancel')}
                    </Button>
                    <Button
                        onClick={() => {
                            setShowDeleteDialog(false);
                            props.onDelete(runIdToDelete);
                        }}
                        color="primary"
                        autoFocus
                    >
                        {t('run.list.deleteDialog.confirm')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
