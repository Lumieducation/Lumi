import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { IState } from '../../state';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Divider from '@material-ui/core/Divider';

import DeleteIcon from '@material-ui/icons/Delete';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import H5PAvatar from './H5PAvatar';
import ListSubheader from '@material-ui/core/ListSubheader';
import RunLink from './RunLink';

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

export default function FolderList(props: {
    deleteCallback: (id: string) => void;
}) {
    const classes = useStyles();
    const runs = useSelector((state: IState) => state.run.runs);
    const { t } = useTranslation();

    return (
        <List
            subheader={<ListSubheader>{t('run.list.header')}</ListSubheader>}
            className={classes.root}
        >
            {runs.length === 0 && (
                <ListItem>
                    <ListItemText
                        primary={t('run.list.no-uploaded-h5p')}
                    ></ListItemText>
                </ListItem>
            )}
            {runs.map((run) => (
                <div key={run.id}>
                    <Divider variant="inset" component="li" />

                    <ListItem>
                        <ListItemAvatar>
                            <H5PAvatar mainLibrary={run.mainLibrary} />
                        </ListItemAvatar>
                        <ListItemText primary={run.title} secondary={run.id} />
                        <div className={classes.center}>
                            <RunLink id={run.id} />
                        </div>
                        <ListItemSecondaryAction>
                            <IconButton
                                onClick={() => props.deleteCallback(run.id)}
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
    );
}
