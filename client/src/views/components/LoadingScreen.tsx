import React from 'react';

import LinearProgress from '@material-ui/core/LinearProgress';
import Logo from './Logo';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            background: theme.props?.MuiAppBar?.style?.background,
            height: '100vh'
        }
    })
);

export default function SwitchListSecondary() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <Logo />
            <LinearProgress />
        </div>
    );
}
