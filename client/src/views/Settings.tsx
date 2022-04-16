import React from 'react';
import clsx from 'clsx';

import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Badge from '@material-ui/core/Badge';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import CloseIcon from '@material-ui/icons/Close';
import SettingsIcon from '@material-ui/icons/Settings';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
// import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import UpdateIcon from '@material-ui/icons/Update';

import SettingsList from './components/Settings/GeneralSettingsList';
import AccountSettingsList from './components/Settings/AccountSettingsList';
import SettingsLibraryManagement from './components/Settings/LibraryManagement';
import UpdateSettings from './components/Settings/UpdatesSettings';
import LinkList from './components/Settings/LinkList';

import { IState } from '../state';
import { track } from '../state/track/actions';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        appBar: {
            position: 'relative'
        },
        title: {
            marginLeft: theme.spacing(2),
            flex: 1
        },
        root: {
            display: 'flex',
            paddingLeft: drawerWidth
        },
        heading: {
            fontSize: theme.typography.pxToRem(15),
            flexBasis: '33.33%',
            flexShrink: 0
        },
        secondaryHeading: {
            fontSize: theme.typography.pxToRem(15),
            color: theme.palette.text.secondary
        },
        center: {
            padding: 20,
            margin: 'auto'
        },
        bg: {
            background: theme.palette.background.default
        },
        paper: {
            minWidth: '640px',
            margin: '20px'
        },
        drawer: {
            width: drawerWidth,
            marginRight: '20px',
            flexShrink: 0
        },
        drawerPaper: {
            width: drawerWidth,
            marginTop: '64px'
        },
        selected: {
            backgroundColor: theme.palette.background.default,
            color: theme.palette.primary.main
        }
    })
);

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function FullScreenDialog() {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const platformSupportsUpdates = useSelector(
        (state: IState) => state.system.platformSupportsUpdates
    );

    const updateAvailable = useSelector(
        (state: IState) => state.updates.updateInfo.version !== ''
    );

    const allowPrerelease = useSelector(
        (state: IState) => state.settings.allowPrerelease
    );

    const enableLumiRun = useSelector(
        (state: IState) => state.settings.enableLumiRun
    );

    const [section, setSection] = React.useState('general');

    const handleClickOpen = () => {
        setOpen(true);
        dispatch(track('Settings', 'click', 'open'));
    };

    const handleClose = () => {
        setOpen(false);
        dispatch(track('Settings', 'click', 'close'));
    };

    return (
        <div>
            <Badge
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                }}
                color="secondary"
                badgeContent={t('updates.badge')}
                invisible={!updateAvailable}
            >
                <IconButton color="inherit" onClick={handleClickOpen}>
                    <SettingsIcon />
                </IconButton>
            </Badge>
            <Dialog
                fullScreen={true}
                open={open}
                onClose={handleClose}
                TransitionComponent={Transition}
            >
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleClose}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            {t('settings.appbar.label')}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer
                    className={classes.drawer}
                    variant="persistent"
                    open={true}
                    classes={{
                        paper: classes.drawerPaper
                    }}
                    anchor="left"
                >
                    <Divider />
                    <List>
                        <ListItem
                            button
                            key="general"
                            onClick={() => setSection('general')}
                            className={clsx({
                                [classes.selected]: section === 'general'
                            })}
                        >
                            <ListItemIcon>
                                <SettingsIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary={t('settings.menu.general')}
                            />
                        </ListItem>
                        {platformSupportsUpdates && (
                            <ListItem
                                button
                                key="updates"
                                onClick={() => setSection('updates')}
                                className={clsx({
                                    [classes.selected]: section === 'updates'
                                })}
                            >
                                <ListItemIcon>
                                    <UpdateIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={t('settings.menu.updates')}
                                />
                            </ListItem>
                        )}
                        <ListItem
                            button
                            key="h5p-library-administration"
                            onClick={() =>
                                setSection('h5p-library-administration')
                            }
                            className={clsx({
                                [classes.selected]:
                                    section === 'h5p-library-administration'
                            })}
                        >
                            <ListItemIcon>
                                <LibraryBooksIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary={t(
                                    'settings.menu.h5p-library-administration'
                                )}
                            />
                        </ListItem>
                        {allowPrerelease && enableLumiRun && (
                            <ListItem
                                button
                                key="account"
                                onClick={() => setSection('account')}
                                className={clsx({
                                    [classes.selected]: section === 'account'
                                })}
                            >
                                <ListItemIcon>
                                    <AccountBoxIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={t('settings.menu.account')}
                                />
                            </ListItem>
                        )}
                    </List>
                </Drawer>
                <DialogContent className={classes.bg}>
                    <div className={classes.root}>
                        <div className={classes.center}>
                            {(() => {
                                switch (section) {
                                    case 'general':
                                    default:
                                        return (
                                            <div>
                                                <Paper
                                                    className={classes.paper}
                                                >
                                                    <SettingsList />{' '}
                                                </Paper>
                                                <Paper
                                                    className={classes.paper}
                                                >
                                                    <LinkList />
                                                </Paper>
                                            </div>
                                        );

                                    case 'updates':
                                        return (
                                            <Paper className={classes.paper}>
                                                <UpdateSettings />{' '}
                                            </Paper>
                                        );

                                    case 'h5p-library-administration':
                                        return (
                                            <Paper className={classes.paper}>
                                                <SettingsLibraryManagement />{' '}
                                            </Paper>
                                        );

                                    case 'account':
                                        return (
                                            <Paper className={classes.paper}>
                                                <AccountSettingsList />{' '}
                                            </Paper>
                                        );
                                }
                            })()}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
