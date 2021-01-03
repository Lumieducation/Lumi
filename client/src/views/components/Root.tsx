import React from 'react';

import { makeStyles, Theme } from '@material-ui/core/styles';

export default function Root(props: {
    children: React.ReactNode;
}): JSX.Element {
    const classes = useStyles();

    const { children } = props;
    return (
        <div id="root" className={classes.root}>
            {children}
        </div>
    );
}

const useStyles = makeStyles((theme: Theme) => {
    return {
        root: {
            display: 'flex'
        }
    };
});
