import React from 'react';
import { useSelector } from 'react-redux';

import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import { IState } from '../../state';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        backdrop: {
            zIndex: theme.zIndex.drawer + 1,
            color: '#fff'
        }
    })
);

export default function LumiBackdrop() {
    const classes = useStyles();
    const lockDisplay = useSelector(
        (state: IState) => state.h5peditor.lockDisplay
    );

    return (
        <Backdrop className={classes.backdrop} open={lockDisplay}>
            <CircularProgress color="inherit" />
        </Backdrop>
    );
}
