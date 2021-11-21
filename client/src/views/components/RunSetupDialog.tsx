import React from 'react';
import {
    createStyles,
    Theme,
    withStyles,
    makeStyles,
    WithStyles
} from '@material-ui/core/styles';

import superagent from 'superagent';

import { useTranslation } from 'react-i18next';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';
import PolicyIcon from '@material-ui/icons/Policy';
import EmailIcon from '@material-ui/icons/Email';
import AssignmentIcon from '@material-ui/icons/Assignment';

import Auth, { IAuthProps } from './Auth';

const styles = (theme: Theme) =>
    createStyles({
        root: {
            margin: 0,
            padding: theme.spacing(2)
        },
        closeButton: {
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500]
        }
    });

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            backgroundColor: theme.palette.background.paper
        }
    })
);
export interface DialogTitleProps extends WithStyles<typeof styles> {
    id: string;
    children: React.ReactNode;
    onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
    const { children, classes, onClose, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h6">{children}</Typography>
            {onClose ? (
                <IconButton
                    aria-label="close"
                    className={classes.closeButton}
                    onClick={onClose}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(2)
    }
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(1)
    }
}))(MuiDialogActions);

export interface IRunSetupDialogProps extends IAuthProps {
    open: boolean;
    onClose: () => void;
    email?: string;
    onConsent: () => void;
}
export default function RunSetupDialog(props: IRunSetupDialogProps) {
    const { t } = useTranslation();
    const { email, open, onClose, onConsent } = props;

    const handleConsent = async () => {
        try {
            await superagent.post(`/api/run/consent`);
            onConsent();
        } catch (error: any) {}
    };

    const classes = useStyles();
    const [privacyPolicyConsent, setPrivacyPolicyConsent] =
        React.useState(false);
    const [tosConsent, setTosConsent] = React.useState(false);

    return (
        <Dialog
            onClose={onClose}
            aria-labelledby="customized-dialog-title"
            open={open}
        >
            <DialogTitle id="customized-dialog-title" onClose={onClose}>
                Lumi Run (Beta)
            </DialogTitle>
            <DialogContent dividers>
                <Typography gutterBottom>{t('run.description')}</Typography>
                <Typography gutterBottom>{t('run.legal')}</Typography>

                <List className={classes.root}>
                    <ListItem>
                        <ListItemIcon>
                            <PolicyIcon />
                        </ListItemIcon>
                        <ListItemText
                            id="switch-list-label-privacy-policy"
                            primary={
                                <span>
                                    {t('privacy_policy.title')} [
                                    <a
                                        rel="noreferrer"
                                        href="https://lumi.education/run/privacy-policy"
                                        target="_blank"
                                    >
                                        Link
                                    </a>
                                    ]
                                </span>
                            }
                            secondary={t('privacy_policy.consent')}
                        />
                        <ListItemSecondaryAction>
                            <Switch
                                edge="end"
                                onChange={() =>
                                    setPrivacyPolicyConsent(
                                        !privacyPolicyConsent
                                    )
                                }
                                checked={privacyPolicyConsent}
                                inputProps={{
                                    'aria-labelledby': 'switch-list-label-pp'
                                }}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <AssignmentIcon />
                        </ListItemIcon>
                        <ListItemText
                            id="switch-list-label-tos"
                            primary={
                                <span>
                                    {t('run.tos.header')} [
                                    <a
                                        rel="noreferrer"
                                        href="https://lumi.education/run/terms-of-use"
                                        target="_blank"
                                    >
                                        Link
                                    </a>
                                    ]
                                </span>
                            }
                            secondary={t('run.tos.description')}
                        />
                        <ListItemSecondaryAction>
                            <Switch
                                edge="end"
                                onChange={() => setTosConsent(!tosConsent)}
                                checked={tosConsent}
                                inputProps={{
                                    'aria-labelledby': 'switch-list-label-tos'
                                }}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <EmailIcon />
                        </ListItemIcon>
                        <ListItemText
                            id="switch-list-label-privacy-policy"
                            primary={t('settings.account.email.title')}
                            secondary={
                                email || t('settings.account.email.not-set')
                            }
                        />
                        <ListItemSecondaryAction>
                            <Auth {...props} />
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    {t('run.setupDialog.close')}
                </Button>
                <Button
                    disabled={!email || !tosConsent || !privacyPolicyConsent}
                    autoFocus={true}
                    onClick={handleConsent}
                    color="primary"
                >
                    {t('run.setupDialog.start')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
