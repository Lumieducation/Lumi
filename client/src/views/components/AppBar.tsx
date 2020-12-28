import React from 'react';

import { default as MAppBar } from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import AppIcon from '@material-ui/icons/Apps';

import { Link } from 'react-router-dom';

export default function AppBar(props: {
    // closeLeftDrawer?: () => void;
    // leftDrawerOpen: boolean;
    // openLeftDrawer?: () => void;
}): JSX.Element {
    // const { closeLeftDrawer, leftDrawerOpen, openLeftDrawer } = props;
    const classes = useStyles();

    return (
        <MAppBar
            position="fixed"
            className={classes.appBar}
            // className={clsx(classes.appBar, {
            //     [classes.appBarShift]: leftDrawerOpen
            // })}
        >
            <Toolbar>
                <Link
                    to="/"
                    style={{ color: 'inherit', textDecoration: 'inherit' }}
                >
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        // onClick={() => {
                        //     track('app_bar', 'click', 'menu_icon');
                        //     if (openLeftDrawer) {
                        //         openLeftDrawer();
                        //     }
                        // }}
                        edge="start"
                        // className={clsx(
                        //     classes.menuButton,
                        //     leftDrawerOpen && classes.hide
                        // )}
                    >
                        <AppIcon />
                    </IconButton>
                </Link>
                <Typography variant="h6" noWrap={true}>
                    Lumi
                </Typography>
                <div className={classes.grow} />
                {/* <IconButton
                    aria-label="report an issue"
                    color="inherit"
                    onClick={() => {
                        if (closeLeftDrawer) {
                            closeLeftDrawer();
                        }
                        Sentry.showReportDialog();
                    }}
                >
                    <BugReport />
                </IconButton> */}
            </Toolbar>
        </MAppBar>
    );
}

const useStyles = makeStyles((theme: Theme) => {
    return {
        appBar: {
            zIndex: theme.zIndex.drawer + 1
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
