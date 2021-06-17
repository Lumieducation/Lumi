import React from 'react';
import {
    createStyles,
    Theme,
    withStyles,
    makeStyles,
    WithStyles
} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Switch from '@material-ui/core/Switch';

import PolicyIcon from '@material-ui/icons/Policy';
import BugReportIcon from '@material-ui/icons/BugReport';
import InsertChartIcon from '@material-ui/icons/InsertChart';
import UpdateIcon from '@material-ui/icons/Update';
import TranslateIcon from '@material-ui/icons/Translate';

import LanguageList from './Settings/LanguageList';
import LinkList from './Settings/LinkList';

import { IState, actions } from '../../state';

const styles = (theme: Theme) =>
    createStyles({
        root: {
            margin: 0,
            width: '400px',
            padding: theme.spacing(2)
        },
        closeButton: {
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500]
        },
        list: {
            width: '100%',
            backgroundColor: theme.palette.background.paper
        }
    });

const useStyles = makeStyles((theme: Theme) => {
    return {
        warning: {
            color: 'red'
        },
        button: {
            margin: theme.spacing(1)
        }
    };
});

export interface DialogTitleProps extends WithStyles<typeof styles> {
    id: string;
    children: React.ReactNode;
    onClose: () => void;
}

const DialogContent = withStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(2)
    }
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1),
        minWidth: 380
    }
}))(MuiDialogActions);

export default function CustomizedDialogs() {
    const dispatch = useDispatch();
    const settings = useSelector((state: IState) => state.settings);
    const platformSupportsUpdates = useSelector(
        (state: IState) => state.system.platformSupportsUpdates
    );

    const classes = useStyles();
    const { t } = useTranslation();

    const handleSave = () => {
        dispatch(
            actions.settings.updateSettings({ ...settings, firstOpen: false })
        );
    };

    const handleAcceptAll = () => {
        dispatch(
            actions.settings.updateSettings({
                ...settings,
                bugTracking: true,
                usageStatistics: true,
                privacyPolicyConsent: true,
                autoUpdates: true,
                firstOpen: false
            })
        );
    };

    return (
        <Dialog
            // onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={settings.firstOpen}
        >
            <DialogContent dividers>
                <Typography variant="body2" gutterBottom>
                    {t('setup_dialog.description')}
                </Typography>
                <LinkList />

                <List
                    subheader={
                        <ListSubheader>
                            {t('settings.appbar.label')}
                        </ListSubheader>
                    }
                >
                    <ListItem>
                        <ListItemIcon>
                            <PolicyIcon />
                        </ListItemIcon>
                        <ListItemText
                            id="switch-list-label-privacy-policy"
                            primary={t('privacy_policy.title')}
                            secondary={t('privacy_policy.consent')}
                        />
                        <ListItemSecondaryAction>
                            <Switch
                                edge="end"
                                onChange={() =>
                                    dispatch(
                                        actions.settings.changeSetting(
                                            {
                                                privacyPolicyConsent:
                                                    !settings.privacyPolicyConsent
                                            },
                                            false
                                        )
                                    )
                                }
                                checked={settings.privacyPolicyConsent}
                                inputProps={{
                                    'aria-labelledby':
                                        'switch-list-label-privacy-policy'
                                }}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <BugReportIcon />
                        </ListItemIcon>
                        <ListItemText
                            id="switch-list-label-bluetooth"
                            primary={t('bug_report.title')}
                            secondary={t('bug_report.consent')}
                        />
                        <ListItemSecondaryAction>
                            <Switch
                                edge="end"
                                onChange={() =>
                                    dispatch(
                                        actions.settings.changeSetting(
                                            {
                                                bugTracking:
                                                    !settings.bugTracking
                                            },
                                            false
                                        )
                                    )
                                }
                                checked={settings.bugTracking}
                                inputProps={{
                                    'aria-labelledby':
                                        'switch-list-label-bluetooth'
                                }}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <InsertChartIcon />
                        </ListItemIcon>
                        <ListItemText
                            id="switch-list-label-bluetooth"
                            primary={t('usage_statistics.title')}
                            secondary={t('usage_statistics.consent')}
                        />
                        <ListItemSecondaryAction>
                            <Switch
                                edge="end"
                                onChange={() =>
                                    dispatch(
                                        actions.settings.changeSetting(
                                            {
                                                usageStatistics:
                                                    !settings.usageStatistics
                                            },
                                            false
                                        )
                                    )
                                }
                                checked={settings.usageStatistics}
                                inputProps={{
                                    'aria-labelledby':
                                        'switch-list-label-bluetooth'
                                }}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    {platformSupportsUpdates && (
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
                                            actions.settings.changeSetting(
                                                {
                                                    autoUpdates:
                                                        !settings.autoUpdates
                                                },
                                                false
                                            )
                                        )
                                    }
                                    checked={settings.autoUpdates}
                                    inputProps={{
                                        'aria-labelledby':
                                            'switch-list-label-updates'
                                    }}
                                />
                            </ListItemSecondaryAction>
                        </ListItem>
                    )}
                    <ListItem>
                        <ListItemIcon>
                            <TranslateIcon />
                        </ListItemIcon>
                        <ListItemText
                            id="switch-list-label-updates"
                            primary={t('language.title')}
                            secondary={t('language.description')}
                        />
                    </ListItem>
                    <ListItem>
                        <LanguageList />
                    </ListItem>
                </List>
                {settings.privacyPolicyConsent ? null : (
                    <Typography
                        className={classes.warning}
                        variant="body2"
                        gutterBottom
                    >
                        {t('setup_dialog.consent_warning')}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleSave}
                    color="secondary"
                    disabled={!settings.privacyPolicyConsent}
                >
                    {t('setup_dialog.accept_selected')}
                </Button>
                <Button
                    autoFocus={true}
                    onClick={handleAcceptAll}
                    color="primary"
                    // disabled={!settings.privacyPolicyConsent}
                >
                    {t('setup_dialog.accept_all')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
