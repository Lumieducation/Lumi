// modules
import * as React from 'react';

import { makeStyles, Theme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) => {
    return {
        content: {
            margin: 'auto',
            marginTop: '70px',
            maxWidth: '680px'
        }
    };
});

export default function GradientBackground(props: {
    children: React.ReactNode;
}): JSX.Element {
    const classes = useStyles();
    return <div className={classes.content}>{props.children}</div>;
}
