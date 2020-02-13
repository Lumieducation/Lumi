import React from 'react';

import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles, Theme } from '@material-ui/core/styles';

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

import { drawerWidth } from '../../theme';

export default function LeftDrawer(props: {
    children?: React.ReactNode;
    closeLeftDrawer: () => void;
    leftDrawerOpen: boolean;
}): JSX.Element {
    const { children, leftDrawerOpen, closeLeftDrawer } = props;

    const classes = useStyles();

    return (
        <Drawer
            className={classes.drawer}
            variant="persistent"
            anchor="left"
            open={leftDrawerOpen}
            classes={{
                paper: classes.drawerPaper
            }}
        >
            <div className={classes.drawerHeader}>
                <IconButton onClick={closeLeftDrawer}>
                    <ChevronLeftIcon />
                </IconButton>
            </div>
            <Divider />
            {children}
        </Drawer>
    );
}

const useStyles = makeStyles((theme: Theme) => {
    return {
        drawer: {
            flexShrink: 0,
            width: drawerWidth
        },
        drawerHeader: {
            alignItems: 'center',
            display: 'flex',
            padding: theme.spacing(0, 1),
            ...theme.mixins.toolbar,
            justifyContent: 'flex-end'
        },
        drawerPaper: {
            width: drawerWidth
        }
    };
});
