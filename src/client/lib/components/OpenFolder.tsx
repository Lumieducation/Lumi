import React from 'react';

import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Grid from '@material-ui/core/Grid';

export default function OpenFolder(props: {
    onClick: () => void;
}): JSX.Element {
    return (
        <Grid
            container={true}
            direction="column"
            alignItems="center"
            justify="center"
        >
            <Grid item={true} xs={12}>
                <ButtonGroup
                    variant="contained"
                    color="primary"
                    aria-label="split button"
                    onClick={props.onClick}
                >
                    <Button>Open Folder</Button>
                </ButtonGroup>
            </Grid>
        </Grid>
    );
}
