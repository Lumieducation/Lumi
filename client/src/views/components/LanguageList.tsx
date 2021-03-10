import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';

import { useTranslation } from 'react-i18next';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import { IState, actions } from '../../state';

const useStyles = makeStyles({
    formControl: {
        width: '100%'
    }
});

export default function LanguageList() {
    const classes = useStyles();
    const language = useSelector((state: IState) => state.settings.language);
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();

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
                    await i18n.loadLanguages(event.target.value as string);
                    i18n.changeLanguage(event.target.value as string);
                }}
            >
                <MenuItem value={'af'}>Afrikaans</MenuItem>
                <MenuItem value={'sq'}>Shqip</MenuItem>
                <MenuItem value={'am'}>አማርኛ</MenuItem>
                <MenuItem value={'ar'}>العربية</MenuItem>
                <MenuItem value={'hy'}>Հայերեն</MenuItem>
                <MenuItem value={'az'}>azərbaycan dili</MenuItem>
                <MenuItem value={'eu'}>euskara</MenuItem>
                <MenuItem value={'be'}>беларуская мова</MenuItem>

                <MenuItem value={'de'}>Deutsch</MenuItem>
                <MenuItem value={'en'}>Englisch</MenuItem>
                <MenuItem value={'en-GB'}>Englisch (British)</MenuItem>
                <MenuItem value={'es'}>Spanish</MenuItem>
            </Select>
        </FormControl>
    );
}
