import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';

import AnalyticsStartPage from './components/AnalyticsStartPage';
import AnalyticsToolbar from './components/AnalyticsToolbar';
import Paper from '@material-ui/core/Paper';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';

import CloseIcon from '@material-ui/icons/Close';

import { groupBy } from 'lodash';

import LumixAPIViewer from './components/AnalyticsTable';

import { actions, IState } from '../state';

export default function Analytics() {
    const dispatch = useDispatch();
    const classes = useStyles();
    const { t } = useTranslation();

    const files = useSelector((state: IState) => state.analytics.files);
    const [searchText, setSearchText] = useState('');

    const f = files.filter((file) => !file.error);
    const d = groupBy(f, (o) => o.contentHash);

    let e = [];
    for (const key in d) {
        e.push(
            <Paper className={classes.paper}>
                <LumixAPIViewer
                    key={key}
                    interactions={d[key][0].interactions}
                    users={d[key]
                        .filter(
                            (v) =>
                                v.name
                                    .toLowerCase()
                                    .indexOf(searchText.toLowerCase()) > -1
                        )
                        .map((v) => {
                            return {
                                id: v.file,
                                name: v.name,
                                results: v.results,
                                error: v.error
                            };
                        })}
                />
            </Paper>
        );
    }

    const brokenFiles = files.filter((file) => file.error);

    return (
        <div style={{ marginTop: '64px' }}>
            {files.length === 0 ? (
                <AnalyticsStartPage
                    primaryButtonClick={() =>
                        dispatch(actions.analytics.importAnalytics())
                    }
                />
            ) : null}

            {files.length > 0 ? (
                <div>
                    <AnalyticsToolbar
                        openFolder={() =>
                            dispatch(actions.analytics.importAnalytics())
                        }
                        search={(text: string) => setSearchText(text)}
                    />
                    {e}
                </div>
            ) : null}
            {brokenFiles.length > 0 ? (
                <Paper className={classes.paper}>
                    <List
                        component="nav"
                        aria-labelledby="nested-list-subheader"
                        subheader={
                            <ListSubheader
                                component="div"
                                id="nested-list-subheader"
                            >
                                {t('analytics.brokenFiles')}
                            </ListSubheader>
                        }
                    >
                        {brokenFiles.map((brokenFile) => (
                            <ListItem key={brokenFile.file}>
                                <ListItemAvatar>
                                    <Avatar className={classes.icon}>
                                        <CloseIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={brokenFile.file}
                                    secondary={t(
                                        `analytics.errors.${brokenFile.code}`
                                    )}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            ) : null}
        </div>
    );
}

const useStyles = makeStyles((theme: Theme) => {
    return {
        paper: {
            margin: '20px'
        },
        icon: {
            background: theme.palette.error.main
        }
    };
});
