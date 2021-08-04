import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';

import { useTranslation } from 'react-i18next';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

import { IState, actions } from '../../../state';
import { track } from '../../../state/track/actions';

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
                <MenuItem value={'af'}>Afrikaans</MenuItem>
                <MenuItem value={'ar'}>العربية</MenuItem>
                <MenuItem value={'bg'}>български език</MenuItem>
                <MenuItem value={'bs'}>bosanski jezik</MenuItem>
                <MenuItem value={'ca'}>català, valencià</MenuItem>
                <MenuItem value={'cs'}>čeština, český jazyk</MenuItem>
                <MenuItem value={'de'}>Deutsch</MenuItem>
                <MenuItem value={'el'}>ελληνικά</MenuItem>
                <MenuItem value={'en'}>English</MenuItem>
                <MenuItem value={'en-GB'}>English (British)</MenuItem>
                <MenuItem value={'es'}>español</MenuItem>
                <MenuItem value={'es-MX'}>español mexicano</MenuItem>
                <MenuItem value={'et'}>eesti, eesti keel</MenuItem>
                <MenuItem value={'eu'}>euskara, euskera</MenuItem>
                <MenuItem value={'fi'}>suomi, suomen kieli</MenuItem>
                <MenuItem value={'fr'}>français</MenuItem>
                <MenuItem value={'it'}>Italiano</MenuItem>
                <MenuItem value={'km'}>ខ្មែរ, ខេមរភាសា, ភាសាខ្មែរ</MenuItem>
                <MenuItem value={'ko'}>한국어</MenuItem>
                <MenuItem value={'nb'}>Norsk Bokmål</MenuItem>
                <MenuItem value={'nl'}>Nederlands</MenuItem>
                <MenuItem value={'nn'}>Norsk Nynorsk</MenuItem>
                <MenuItem value={'pt'}>Português</MenuItem>
                <MenuItem value={'ru'}>русский</MenuItem>
                <MenuItem value={'sl'}>slovenski jezik</MenuItem>
                <MenuItem value={'sv'}>Svenska</MenuItem>
                <MenuItem value={'tr'}>Türkçe</MenuItem>
                <MenuItem value={'zh'}>中文 (Zhōngwén), 汉语, 漢語</MenuItem>
            </Select>
        </FormControl>
    );
}
