// modules
import clsx from 'clsx';
import * as React from 'react';

import { makeStyles, Theme } from '@material-ui/core/styles';

interface IPassedProps {
    error?: boolean;
}

interface IStateProps extends IPassedProps {
    classes: any;
}

interface IDispatchProps {}

interface IComponentState {}

interface IProps extends IStateProps, IDispatchProps {}

const useStyles = makeStyles((theme: Theme) => {
    return {
        background: {
            background: 'linear-gradient(45deg, #1abc9c 0%, #3498db 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '100vh',
            width: '100%'
        },
        error: {
            background: 'linear-gradient(45deg, #e67e22 0%, #e74c3c 100%)'
        }
    };
});

export default function GradientBackground(props: {
    children: React.ReactNode;
    error?: boolean;
}): JSX.Element {
    const classes = useStyles();
    return (
        <div
            className={clsx(classes.background, {
                [classes.error]: props.error
            })}
        >
            {props.children}
        </div>
    );
}
