import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
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

import { actions, IState } from '../../state';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            backgroundColor: theme.palette.background.paper
        }
    })
);

export default function SwitchListSecondary() {
    const classes = useStyles();

    const dispatch = useDispatch();
    const settings = useSelector((state: IState) => state.settings);

    return (
        <List
            subheader={<ListSubheader>Settings</ListSubheader>}
            className={classes.root}
        >
            <ListItem>
                <ListItemIcon>
                    <PolicyIcon />
                </ListItemIcon>
                <ListItemText
                    id="switch-list-label-privacy-policy"
                    primary="Privacy Policy"
                    secondary="I have read and consent to the privacy policy."
                />
                <ListItemSecondaryAction>
                    <Switch
                        edge="end"
                        onChange={() =>
                            dispatch(
                                actions.settings.changeSetting({
                                    privacyPolicyConsent: !settings.privacyPolicyConsent
                                })
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
                    primary="Bug & Crash Reports"
                    secondary="I allow this application to send bug & crash reports."
                />
                <ListItemSecondaryAction>
                    <Switch
                        edge="end"
                        onChange={() =>
                            dispatch(
                                actions.settings.changeSetting({
                                    bugTracking: !settings.bugTracking
                                })
                            )
                        }
                        checked={settings.bugTracking}
                        inputProps={{
                            'aria-labelledby': 'switch-list-label-bluetooth'
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
                    primary="Usage statistics"
                    secondary="I allow this application to send anonymous usage statistics."
                />
                <ListItemSecondaryAction>
                    <Switch
                        edge="end"
                        onChange={() =>
                            dispatch(
                                actions.settings.changeSetting({
                                    usageStatistics: !settings.usageStatistics
                                })
                            )
                        }
                        checked={settings.usageStatistics}
                        inputProps={{
                            'aria-labelledby': 'switch-list-label-bluetooth'
                        }}
                    />
                </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
                <ListItemIcon>
                    <UpdateIcon />
                </ListItemIcon>
                <ListItemText
                    id="switch-list-label-updates"
                    primary="Automatic Updates"
                    secondary="I allow this application to automatically check for updates."
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
