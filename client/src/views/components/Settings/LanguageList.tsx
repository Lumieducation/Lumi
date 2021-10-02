import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import { IState, actions } from '../../../state';
import { track } from '../../../state/track/actions';
import superagent from 'superagent';

const useStyles = makeStyles({
    formControl: {
        width: '100%'
    }
});

export default function LanguageList() {
    const classes = useStyles();
    const language = useSelector((state: IState) => state.settings.language);
    const [locales, setLocales] = useState<{ code: string; name: string }[]>([
        { code: 'en', name: 'English' }
    ]);
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        superagent.get(`/api/v1/system/locales`).then((res) => {
            setLocales(res.body);
        });
    }, []);

    return (
        <FormControl className={classes.formControl}>
            <InputLabel id="demo-simple-select-label">
                {t('language.title')}
            </InputLabel>
            <Select
                fullWidth={true}
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={language}
                onChange={async (event) => {
                    dispatch(
                        actions.settings.changeSetting({
                            language: event.target.value as string
                        })
                    );
                    dispatch(
                        track(
                            'Settings',
                            'change_language',
                            event.target.value as string
                        )
                    );
                    await i18n.loadLanguages(event.target.value as string);
                    i18n.changeLanguage(event.target.value as string);
                }}
            >
                {locales.map((locale) => (
                    <MenuItem value={locale.code}>{locale.name}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
