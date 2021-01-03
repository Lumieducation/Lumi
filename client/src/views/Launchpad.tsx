import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

import { I18n } from 'react-redux-i18n';

import MainSection from './components/MainSection';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            width: '100%',
            padding: '50px'
        },
        paper: {
            padding: theme.spacing(2),
            textAlign: 'center',
            color: theme.palette.text.secondary
        },
        card: {
            maxWidth: 345,
            minWidth: 345
        },
        media: {
            height: 140
        }
    })
);

export default function MediaCard() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <MainSection>
                <Grid container spacing={3}>
                    <Grid item xs={3}>
                        <Card className={classes.card}>
                            <CardActionArea>
                                <CardMedia
                                    className={classes.media}
                                    image="/assets/h5p/h5p.png"
                                    title="Contemplative Reptile"
                                />
                                <CardContent>
                                    <Typography
                                        gutterBottom
                                        variant="h5"
                                        component="h2"
                                    >
                                        H5P Editor
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        component="p"
                                    >
                                        {I18n.t(
                                            'editor.startPage.welcomeMessage'
                                        )}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                            <CardActions>
                                <Button size="small" color="primary">
                                    <Link
                                        to="/h5peditor"
                                        style={{
                                            color: 'inherit',
                                            textDecoration: 'inherit'
                                        }}
                                    >
                                        {I18n.t('editor.startPage.start')}
                                    </Link>
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
            </MainSection>
        </div>
    );
}
