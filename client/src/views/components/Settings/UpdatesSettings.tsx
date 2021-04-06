import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Switch from '@material-ui/core/Switch';

import UpdateIcon from '@material-ui/icons/Update';

import { actions, IState } from '../../../state';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            backgroundColor: theme.palette.background.paper
        }
    })
);

export default function UpdatesSettingsList() {
    const classes = useStyles();

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const settings = useSelector((state: IState) => state.settings);

    return (
        <List
            subheader={
                <ListSubheader>{t('settings.updates.header')}</ListSubheader>
            }
            className={classes.root}
        >
            <ListItem>
                <ListItemIcon>
                    <UpdateIcon />
                </ListItemIcon>
                <ListItemText
                    id="switch-list-label-updates"
                    primary={t('updates.title')}
                    secondary={t('updates.consent')}
                />
                <ListItemSecondaryAction>
                    <Switch
                        edge="end"
                        onChange={() =>
                            dispatch(
                                actions.settings.changeSetting({
                                    autoUpdates: !settings.autoUpdates
                                })
                            )
                        }
                        checked={settings.autoUpdates}
                        inputProps={{
                            'aria-labelledby': 'switch-list-label-updates'
                        }}
                    />
                </ListItemSecondaryAction>
            </ListItem>
        </List>
    );
}
