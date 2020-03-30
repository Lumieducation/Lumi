import clsx from 'clsx';
import React from 'react';

import { makeStyles, Theme } from '@material-ui/core/styles';

import { drawerWidth } from '../../theme';

export default function Main(props: {
    children: React.ReactNode;
    leftDrawerOpen: boolean;
}): JSX.Element {
    const classes = useStyles();

    const { children, leftDrawerOpen } = props;
    return (
        <main
            className={clsx(classes.content, {
                [classes.contentShift]: leftDrawerOpen
            })}
        >
            {children}
        </main>
    );
}

const useStyles = makeStyles((theme: Theme) => {
    return {
        content: {
            flexGrow: 1,
            marginLeft: -drawerWidth,
            marginTop: '64px',
            // padding: theme.spacing(3),
            transition: theme.transitions.create('margin', {
                duration: theme.transitions.duration.leavingScreen,
                easing: theme.transitions.easing.sharp
            })
        },
        contentShift: {
            marginLeft: 0,
            transition: theme.transitions.create('margin', {
                duration: theme.transitions.duration.enteringScreen,
                easing: theme.transitions.easing.easeOut
            })
        }
    };
});
