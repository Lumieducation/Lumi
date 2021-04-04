import React from 'react';
import { useTranslation } from 'react-i18next';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import Button from '@material-ui/core/Button';

import EmailIcon from '@material-ui/icons/Email';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            backgroundColor: theme.palette.background.paper
        }
    })
);

export default function AccountSettingsList() {
    const classes = useStyles();

    const { t } = useTranslation();

    return (
        <List
            subheader={
                <ListSubheader>{t('settings.account.label')}</ListSubheader>
            }
            className={classes.root}
        >
            <ListItem>
                <ListItemIcon>
                    <EmailIcon />
                </ListItemIcon>
                <ListItemText
                    id="switch-list-label-privacy-policy"
                    primary={t('settings.account.email.title')}
                    secondary={'test@lumi.education' /*settings.email */}
                />
                <ListItemSecondaryAction>
                    <Button variant="contained">
                        {t('settings.account.email.change')}
                    </Button>
                </ListItemSecondaryAction>
            </ListItem>
        </List>
    );
}
