import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import Auth from '../Auth';

import EmailIcon from '@material-ui/icons/Email';

import { actions, IState } from '../../../state';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            backgroundColor: theme.palette.background.paper
        }
    })
);

export default function SettingsAccountSettingsList() {
    const classes = useStyles();

    const { t } = useTranslation();
    const settings = useSelector((state: IState) => state.settings);
    const dispatch = useDispatch();
    return (
        <List
            subheader={
                <ListSubheader>{t('settings.account.label')}</ListSubheader>
            }
            className={classes.root}
        >
            <ListItem>
                <ListItemIcon>
                    <EmailIcon />
                </ListItemIcon>
                <ListItemText
                    id="switch-list-label-privacy-policy"
                    primary={t('settings.account.email.title')}
                    secondary={
                        settings.email || t('settings.account.email.not-set')
                    }
                />
                <ListItemSecondaryAction>
                    <Auth
                        loggedIn={Boolean(settings.email)}
                        handleLogin={(email: string, token: string) => {
                            dispatch(
                                actions.settings.changeSetting({ email, token })
                            );
                            dispatch(
                                actions.notifications.notify(
                                    t('auth.notification.login.success', {
                                        email
                                    }),
                                    'success'
                                )
                            );
                        }}
                        handleLogout={() => {
                            dispatch(
                                actions.settings.changeSetting({
                                    email: undefined,
                                    token: undefined
                                })
                            );
                            dispatch(
                                actions.notifications.notify(
                                    t('auth.notification.logout.success'),
                                    'success'
                                )
                            );
                        }}
                    />
                </ListItemSecondaryAction>
            </ListItem>
        </List>
    );
}
