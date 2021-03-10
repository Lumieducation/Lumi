import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import TranslateIcon from '@material-ui/icons/Translate';

import { useTranslation } from 'react-i18next';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import { IState, actions } from '../../state';
import LanguageList from './LanguageList';

const useStyles = makeStyles({
    root: {
        maxWidth: 345,
        margin: 25
    },
    media: {
        height: 140,
        background: 'linear-gradient(45deg, #1abc9c 0%, #3498db 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center'
    },
    analyticsIcon: {
        margin: 'auto',
        height: 120,
        width: 120
    },
    formControl: {
        width: '100%'
    }
});

export default function BugReportSettingsCard() {
    const classes = useStyles();
    const language = useSelector((state: IState) => state.settings.language);
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();

    return (
        <Card className={classes.root}>
            <CardActionArea>
                <CardMedia className={classes.media} title="Lumi Analytics">
                    <TranslateIcon className={classes.analyticsIcon} />
                </CardMedia>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        {t('language.title')}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        component="p"
                    >
                        {t('language.description')}
                    </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <LanguageList />
            </CardActions>
        </Card>
    );
}
