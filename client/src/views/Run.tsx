import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { actions } from '../state';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import RunList from './components/RunList';

import RunSetupDialog from './components/RunSetupDialog';
import RunConnectionErrorDialog from './components/RunConnectionErrorDialog';
import { RUN_GET_RUNS_ERROR, RUN_NOT_AUTHORIZED } from '../state/Run/RunTypes';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            marginTop: '64px',
            backgroundColor: theme.palette.background.paper,
            display: 'flex'
        },
        link: {
            minWidth: '280px'
        },
        center: {
            margin: 'auto'
        },
        uploadButton: {
            margin: '24px'
        }
    })
);

export default function FolderList() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const history = useHistory();

    useEffect(() => {
        dispatch(actions.run.getRuns()).then((action: any) => {
            if (action.type === RUN_NOT_AUTHORIZED) {
                dispatch(actions.run.updateState({ showSetupDialog: true }));
            }
            if (action.type === RUN_GET_RUNS_ERROR) {
                dispatch(
                    actions.run.updateState({ showConnectionErrorDialog: true })
                );
            }
        });
    });

    return (
        <div>
            <RunList
                deleteCallback={(id: string) =>
                    dispatch(actions.run.deleteFromRun(id))
                }
            />

            <Grid container={true} spacing={2} justify="center">
                <Grid item={true}>
                    <Button
                        className={classes.uploadButton}
                        id="editor-startpage-primaryButton"
                        onClick={() => {
                            dispatch(actions.run.upload());
                        }}
                        variant="contained"
                        color="primary"
                        startIcon={<CloudUploadIcon />}
                    >
                        Upload
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
}
