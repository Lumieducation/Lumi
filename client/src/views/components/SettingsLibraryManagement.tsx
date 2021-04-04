import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Switch from '@material-ui/core/Switch';

import Button from '@material-ui/core/Button';

import EmailIcon from '@material-ui/icons/Email';

import { actions, IState } from '../../state';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            backgroundColor: theme.palette.background.paper
        }
    })
);

export default function SettingsLibraryManagement() {
    const classes = useStyles();

    const dispatch = useDispatch();
    const settings = useSelector((state: IState) => state.settings);

    const { t } = useTranslation();

    return (
        <List
            subheader={
                <ListSubheader>{t('settings.libraries.label')}</ListSubheader>
            }
            className={classes.root}
        >
            <ListItem>
                <ListItemIcon>
                    <EmailIcon />
                </ListItemIcon>
                <ListItemText
                    id="switch-list-label-privacy-policy"
                    primary={t('libraries will come here')}
                    secondary={'...' /*settings.email */}
                />
                <ListItemSecondaryAction>
                    <Button variant="contained">{t('action')}</Button>
                </ListItemSecondaryAction>
            </ListItem>
        </List>
    );
}
