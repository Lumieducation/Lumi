import React from 'react';
import { useTranslation } from 'react-i18next';

import clsx from 'clsx';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import FilledInput from '@material-ui/core/FilledInput';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import FileCopyIcon from '@material-ui/icons/FileCopy';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexWrap: 'wrap'
        },
        margin: {
            margin: theme.spacing(1)
        },
        withoutLabel: {
            marginTop: theme.spacing(3)
        },
        textField: {
            width: '60ch'
        }
    })
);

export default function RunLink(props: { id: string }) {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <FormControl
            className={clsx(classes.margin, classes.textField)}
            variant="outlined"
        >
            <InputLabel htmlFor="outlined-adornment-link">
                {t('run.link')}
            </InputLabel>
            <OutlinedInput
                id="outlined-adornment-link"
                // type={values.showPassword ? 'text' : 'password'}
                value={`https://Lumi.run/${props.id}`}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton aria-label="run link" edge="end">
                            <FileCopyIcon />
                        </IconButton>
                    </InputAdornment>
                }
                labelWidth={70}
            />
        </FormControl>
    );
}
