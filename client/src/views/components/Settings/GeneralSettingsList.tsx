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
import BugReportIcon from '@material-ui/icons/BugReport';
import InsertChartIcon from '@material-ui/icons/InsertChart';

import TranslateIcon from '@material-ui/icons/Translate';

import { actions, IState } from '../../../state';
import LanguageList from './LanguageList';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            backgroundColor: theme.palette.background.paper
        }
    })
);

export default function SettingsGeneralSettingsList() {
    const classes = useStyles();

    const dispatch = useDispatch();
    const settings = useSelector((state: IState) => state.settings);

    const { t } = useTranslation();

    return (
        <List
            subheader={
                <ListSubheader>{t('settings.general.header')}</ListSubheader>
            }
            className={classes.root}
        >
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
                    primary={t('usage_statistics.title')}
                    secondary={t('usage_statistics.consent')}
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
                    <TranslateIcon />
                </ListItemIcon>
                <ListItemText
                    id="switch-list-label-bluetooth"
                    primary={t('language.title')}
                    secondary={t('language.description')}
                />
                <ListItemSecondaryAction>
                    <a
                        href="https://translate-h5p.tk/weblate/projects/lumi-education/"
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            color: 'inherit',
                            textDecoration: 'inherit'
                        }}
                    >
                        <Button>{t('language.help_translate')}</Button>
                    </a>
                </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
                <LanguageList />
            </ListItem>
        </List>
    );
}
