import clsx from 'clsx';
import React from 'react';

import * as Sentry from '@sentry/browser';

import { default as MAppBar } from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import BugReport from '@material-ui/icons/BugReport';
import MenuIcon from '@material-ui/icons/Menu';

import { drawerWidth } from '../../theme';

export default function AppBar(props: {
    leftDrawerOpen: boolean;
    openLeftDrawer?: () => void;
}): JSX.Element {
    const { leftDrawerOpen, openLeftDrawer } = props;
    const classes = useStyles();

    return (
        <MAppBar
            position="fixed"
            className={clsx(classes.appBar, {
                [classes.appBarShift]: leftDrawerOpen
            })}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={openLeftDrawer}
                    edge="start"
                    className={clsx(
                        classes.menuButton,
                        leftDrawerOpen && classes.hide
                    )}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap={true}>
                    Lumi
                </Typography>
                <div className={classes.grow} />
                <IconButton
                    aria-label="report an issue"
                    color="inherit"
                    onClick={() => {
                        Sentry.showReportDialog();
                    }}
                >
                    <BugReport />
                </IconButton>
            </Toolbar>
        </MAppBar>
    );
}

const useStyles = makeStyles((theme: Theme) => {
    return {
        appBar: {
            '-webkit-app-region': 'drag',
            transition: theme.transitions.create(['margin', 'width'], {
                duration: theme.transitions.duration.leavingScreen,
                easing: theme.transitions.easing.sharp
            })
        },
        appBarShift: {
            marginLeft: drawerWidth,
            transition: theme.transitions.create(['margin', 'width'], {
                duration: theme.transitions.duration.enteringScreen,
                easing: theme.transitions.easing.easeOut
            }),
            width: `calc(100% - ${drawerWidth}px)`
        },
        grow: {
            flexGrow: 1
        },
        hide: {
            display: 'none'
        },
        menuButton: {
            marginRight: theme.spacing(2)
        }
    };
});
