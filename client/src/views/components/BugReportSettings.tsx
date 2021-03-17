import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import BugReportIcon from '@material-ui/icons/BugReport';

import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import { IState, actions } from '../../state';

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
    }
});

export default function BugReportSettingsCard() {
    const classes = useStyles();
    const settings = useSelector((state: IState) => state.settings);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    return (
        <Card className={classes.root}>
            <CardActionArea>
                <CardMedia className={classes.media} title="Lumi Analytics">
                    <BugReportIcon className={classes.analyticsIcon} />
                </CardMedia>
                <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                        {t('bug_report.title')}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        component="p"
                    >
                        {t('bug_report.description')}
                    </Typography>
                </CardContent>
            </CardActionArea>
            <CardActions>
                <FormControlLabel
                    control={
                        <Switch
                            checked={settings.bugTracking}
                            onChange={() =>
                                dispatch(
                                    actions.settings.changeSetting({
                                        bugTracking: !settings.bugTracking
                                    })
                                )
                            }
                        />
                    }
                    label={t('settings.enable')}
                />
                <a
                    href="https://next.lumi.education/app/privacy-policy"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                        color: 'inherit',
                        textDecoration: 'inherit'
                    }}
                >
                    <Button size="small">{t('privacy_policy.title')}</Button>
                </a>
            </CardActions>
        </Card>
    );
}
