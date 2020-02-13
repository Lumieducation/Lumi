import React from 'react';

import Grow from '@material-ui/core/Grow';
import { TransitionProps } from '@material-ui/core/transitions';

import { SnackbarProvider } from 'notistack';

function GrowTransition(props: TransitionProps): JSX.Element {
    return <Grow {...props} />;
}

export default function(props: { children: React.ReactElement }): JSX.Element {
    return (
        <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{
                horizontal: 'center',
                vertical: 'bottom'
            }}
            TransitionComponent={GrowTransition}
        >
            {props.children}
        </SnackbarProvider>
    );
}
