import clsx from 'clsx';
import React from 'react';

import { makeStyles, Theme } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';

export default function Footer(props: {}): JSX.Element {
    const classes = useStyles();

    return (
        <footer className={clsx(classes.content)}>
            <Typography className={classes.text} variant="body2">
                Upload your own H5P for FREE at{' '}
                <a style={{ color: 'white' }} href="http://Lumi.run/upload">
                    Lumi.run/upload
                </a>
            </Typography>
        </footer>
    );
}

const useStyles = makeStyles((theme: Theme) => {
    return {
        content: {
            bottom: '0px',
            flexGrow: 1,
            justifySelf: 'flex-end',
            margin: '20px',
            textAlign: 'center',
            transition: theme.transitions.create('margin', {
                duration: theme.transitions.duration.leavingScreen,
                easing: theme.transitions.easing.sharp
            })
        },
        text: {
            color: 'white'
        }
    };
});
