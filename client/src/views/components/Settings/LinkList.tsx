import React from 'react';
import { useTranslation, getI18n } from 'react-i18next';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import PolicyIcon from '@material-ui/icons/Policy';

export default function SettingsLinkList() {
    const { t } = useTranslation();
    const i18n = getI18n();

    return (
        <List
            subheader={
                <ListSubheader>{t('settings.links.header')}</ListSubheader>
            }
        >
            <a
                href={`https://www.lumi.education/app/privacy-policy?lng=${i18n.language}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'inherit', textDecoration: 'inherit' }}
            >
                <ListItem>
                    <ListItemIcon>
                        <PolicyIcon />
                    </ListItemIcon>
                    <ListItemText
                        id="switch-list-label-privacy-policy"
                        primary={`https://www.lumi.education/app/privacy-policy?lng=${i18n.language}`}
                        secondary={t('privacy_policy.title')}
                    />
                </ListItem>
            </a>
        </List>
    );
}
