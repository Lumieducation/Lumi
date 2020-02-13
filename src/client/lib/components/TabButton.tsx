import React from 'react';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Tab from '@material-ui/core/Tab';

import CloseIcon from '@material-ui/icons/Close';

import H5PAvatar from './H5PAvatar';

export default function TabButton(props: {
    close: () => void;
    label: string;
    mainLibrary: string;
    select: () => void;
}): JSX.Element {
    const { label, mainLibrary } = props;
    return (
        <Tab
            label={
                <Grid
                    container={true}
                    wrap="nowrap"
                    justify="center"
                    spacing={0}
                >
                    <Grid onClick={props.select} item={true}>
                        <H5PAvatar mainLibrary={mainLibrary} />
                    </Grid>
                    <Grid onClick={props.select} item={true}>
                        {label}
                    </Grid>
                    <Grid item={true}>
                        <Button
                            color="inherit"
                            size="small"
                            aria-haspopup="true"
                            onClick={props.close}
                        >
                            <CloseIcon />
                        </Button>
                    </Grid>
                </Grid>
            }
        />
    );
}
