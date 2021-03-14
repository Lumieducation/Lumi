import React from 'react';
import { useTranslation } from 'react-i18next';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import SettingsIcon from '@material-ui/icons/Settings';

import Typography from '@material-ui/core/Typography';

import BugReportSettings from './components/BugReportSettings';
import UpdateSettings from './components/UpdateSettngs';
import SettingsLanguage from './components/SettingsLanguage';

import UsageStatisticsSettingsCard from './components/UsageAnalyticsSettings';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        appBar: {
            position: 'relative'
        },
        title: {
            marginLeft: theme.spacing(2),
            flex: 1
        },
        root: {
            width: '100%',
            display: 'flex'
        },
        heading: {
            fontSize: theme.typography.pxToRem(15),
            flexBasis: '33.33%',
            flexShrink: 0
        },
        secondaryHeading: {
            fontSize: theme.typography.pxToRem(15),
            color: theme.palette.text.secondary
        },
        center: {
            padding: 20,
            margin: 'auto'
        }
    })
);

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function FullScreenDialog() {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const { t } = useTranslation();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <IconButton color="inherit" onClick={handleClickOpen}>
                <SettingsIcon />
            </IconButton>
            <Dialog
                fullScreen
                open={open}
                onClose={handleClose}
                TransitionComponent={Transition}
            >
                <AppBar className={classes.appBar}>
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={handleClose}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            {t('settings.appbar.label')}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <div className={classes.root}>
                    <div className={classes.center}>
                        <BugReportSettings />
                        <UsageStatisticsSettingsCard />
                        <UpdateSettings />
                        <SettingsLanguage />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
