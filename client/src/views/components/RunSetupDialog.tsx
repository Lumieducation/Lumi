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
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';

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
import ListSubheader from '@material-ui/core/ListSubheader';
import Switch from '@material-ui/core/Switch';
import PolicyIcon from '@material-ui/icons/Policy';
import EmailIcon from '@material-ui/icons/Email';
import AssignmentIcon from '@material-ui/icons/Assignment';

import Auth from '../Auth';
import { IState, actions } from '../../state';

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

export default function CustomizedDialogs() {
    // const [open, setOpen] = React.useState(false);
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const history = useHistory();

    const settings = useSelector((state: IState) => state.settings);
    const open = useSelector((state: IState) => state.run.showSetupDialog);

    const handleClose = () => {
        history.push('/');
        dispatch(actions.run.updateState({ showSetupDialog: false }));
    };

    const handleConsent = async () => {
        try {
            await superagent.post(`/api/v1/run/api/consent`);
            dispatch(actions.run.updateState({ showSetupDialog: false }));
            // props.close(false);
        } catch (error) {
            //
        }
    };

    const classes = useStyles();
    const [privacyPolicyConsent, setPrivacyPolicyConsent] = React.useState(
        false
    );
    const [tosConsent, setTosConsent] = React.useState(false);

    return (
        <Dialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
        >
            <DialogTitle id="customized-dialog-title" onClose={handleClose}>
                Lumi Run
            </DialogTitle>
            <DialogContent dividers>
                <Typography gutterBottom>{t('run.description')}</Typography>
                <Typography gutterBottom>{t('run.legal')}</Typography>

                <List
                    subheader={<ListSubheader>Settings</ListSubheader>}
                    className={classes.root}
                >
                    <ListItem>
                        <ListItemIcon>
                            <PolicyIcon />
                        </ListItemIcon>
                        <ListItemText
                            id="switch-list-label-privacy-policy"
                            primary={t('privacy_policy.title')}
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
                            primary={t('run.tos.header')}
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
                                settings.email ||
                                t('settings.account.email.not-set')
                            }
                        />
                        <ListItemSecondaryAction>
                            <Auth />
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary">
                    Close
                </Button>
                <Button
                    disabled={
                        !settings.email || !tosConsent || !privacyPolicyConsent
                    }
                    autoFocus={true}
                    onClick={handleConsent}
                    color="primary"
                >
                    Start
                </Button>
            </DialogActions>
        </Dialog>
    );
}