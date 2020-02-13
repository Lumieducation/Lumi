import * as React from 'react';
import { Redirect } from 'react-router';

import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import Dropzone from 'react-dropzone';

export default function RunUploadPage(props: {
    progress?: number;
    state?: 'pending' | 'success' | 'error';
    upload: (file: File) => void;
    uploadMessage: string;
}): JSX.Element {
    const classes = useStyles();
    return (
        <Container maxWidth="sm" className={classes.heroContent}>
            <Typography
                variant="h5"
                align="center"
                color="textSecondary"
                paragraph={true}
            >
                {(() => {
                    switch (props.state) {
                        case 'pending':
                            return props.progress !== 100
                                ? 'Uploading...'
                                : 'Validating H5P...';

                        case 'error':
                            return `${props.uploadMessage}`;
                        case 'success':
                            return (
                                <Redirect
                                    to={`/analytics?id=${props.uploadMessage}`}
                                />
                            );
                        default:
                            return 'Lumi Run allows you to upload H5P files and share them with your class.';
                    }
                })()}
            </Typography>
            <div className={classes.heroButtons}>
                <Grid container={true} spacing={2} justify="center">
                    <Grid item={true}>
                        {props.state ? null : (
                            <Dropzone
                                onDrop={acceptedFiles =>
                                    props.upload(acceptedFiles[0])
                                }
                            >
                                {({ getRootProps, getInputProps }) => (
                                    <section>
                                        <div {...getRootProps()}>
                                            <input {...getInputProps()} />
                                            <Button
                                                id="run-upload-primaryButton"
                                                variant="contained"
                                                color="primary"
                                            >
                                                Upload H5P
                                            </Button>
                                        </div>
                                    </section>
                                )}
                            </Dropzone>
                        )}
                    </Grid>
                </Grid>
                {props.state === 'pending' ? (
                    <LinearProgress
                        variant={
                            props.progress !== 100
                                ? 'determinate'
                                : 'indeterminate'
                        }
                        value={props.progress || 50}
                    />
                ) : null}
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
            padding: theme.spacing(8, 6, 6)
        },
        icon: {
            marginRight: theme.spacing(2)
        }
    };
});
