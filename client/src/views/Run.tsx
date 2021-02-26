import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actions, IState } from '../state';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Divider from '@material-ui/core/Divider';

import TextField from '@material-ui/core/TextField';
import DeleteIcon from '@material-ui/icons/Delete';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import PlusIcon from '@material-ui/icons/Add';
import H5PAvatar from './components/H5PAvatar';
import ListSubheader from '@material-ui/core/ListSubheader';
import LinearProgress from '@material-ui/core/LinearProgress';

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

const testData = [
    {
        id: 'c8-MD_OJc',
        secret: 'abc',
        mainLibrary: 'H5P.Blanks',
        title: 'TITLE'
    },
    {
        id: 'asdasferg',
        secret: 'a',
        mainLibrary: 'H5P.MultiChoice',
        title: 'hey'
    }
];

export default function FolderList() {
    const classes = useStyles();

    return (
        <List
            subheader={<ListSubheader>Uploaded H5P</ListSubheader>}
            className={classes.root}
        >
            {testData.map((i) => (
                <div>
                    <Divider variant="inset" component="li" />

                    <ListItem>
                        <ListItemAvatar>
                            <H5PAvatar mainLibrary={i.mainLibrary} />
                        </ListItemAvatar>
                        <ListItemText primary={i.title} secondary={i.id} />
                        <div className={classes.center}>
                            <form noValidate autoComplete="off">
                                <TextField
                                    className={classes.link}
                                    id="outlined-basic"
                                    label="Link"
                                    variant="outlined"
                                    value={`http://Lumi.run/${i.id}`}
                                />
                            </form>
                        </div>
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="delete">
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                </div>
            ))}
        </List>
    );
}
