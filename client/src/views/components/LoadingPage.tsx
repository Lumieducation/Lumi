import React from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            display: 'flex',
            height: '100%',
            marginTop: '30%'
        },
        progress: {
            display: 'block',
            margin: 'auto'
        }
    })
);

export default function LoadingPage() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <div className={classes.progress}>
                <CircularProgress size={100} />
            </div>
        </div>
    );
}
