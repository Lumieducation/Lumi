import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { actions } from '../state';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import RunList from './components/RunList';

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
    useEffect(() => {
        dispatch(actions.run.getRuns());
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
