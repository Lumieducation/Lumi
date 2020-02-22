import * as React from 'react';

import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { track } from 'lib/track/actions';

export default function EditorStartPage(props: {
    primaryButtonClick: () => void;
    secondaryButtonClick: () => void;
}): JSX.Element {
    const classes = useStyles();
    return (
        <Container maxWidth="sm" className={classes.heroContent}>
            <Typography
                component="h1"
                variant="h2"
                align="center"
                color="textPrimary"
                gutterBottom={true}
            >
                Lumi H5P Editor
            </Typography>
            <Typography
                variant="h5"
                align="center"
                color="textSecondary"
                paragraph={true}
            >
                Lumi's H5P Editor is a standalone application that lets you
                view, edit and create H5P.
            </Typography>
            <div className={classes.heroButtons}>
                <Grid container={true} spacing={2} justify="center">
                    <Grid item={true}>
                        <Button
                            id="editor-startpage-primaryButton"
                            onClick={() => {
                                track('start_page', 'click', 'primary_button');
                                props.primaryButtonClick();
                            }}
                            variant="contained"
                            color="primary"
                        >
                            Open existing H5P
                        </Button>
                    </Grid>
                    <Grid item={true}>
                        <Button
                            id="editor-startpage-secondaryButton"
                            onClick={() => {
                                track(
                                    'start_page',
                                    'click',
                                    'secondary_button'
                                );
                                props.secondaryButtonClick();
                            }}
                            variant="outlined"
                            color="primary"
                        >
                            Create new H5P
                        </Button>
                    </Grid>
                </Grid>
            </div>
        </Container>
    );
}

const useStyles = makeStyles((theme: Theme) => {
    return {
        card: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        },
        cardContent: {
            flexGrow: 1
        },
        cardGrid: {
            paddingBottom: theme.spacing(8),
            paddingTop: theme.spacing(8)
        },
        cardMedia: {
            paddingTop: '56.25%' // 16:9
        },
        footer: {
            backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(6)
        },
        heroButtons: {
            marginTop: theme.spacing(4)
        },
        heroContent: {
            backgroundColor: theme.palette.background.paper,
            padding: theme.spacing(8, 0, 6)
        },
        icon: {
            marginRight: theme.spacing(2)
        }
    };
});
