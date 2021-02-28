import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actions, IState } from '../state';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import TextField from '@material-ui/core/TextField';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import PlusIcon from '@material-ui/icons/Add';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import H5PAvatar from './components/H5PAvatar';
import ListSubheader from '@material-ui/core/ListSubheader';
import LinearProgress from '@material-ui/core/LinearProgress';
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
            <RunList />

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
