import React from 'react';
import { useTranslation } from 'react-i18next';

import clsx from 'clsx';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';

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

export default function RunLink(props: {
    runId: string;
    onCopy: (runId: string) => void;
}) {
    const classes = useStyles();
    const { t } = useTranslation();
    const { runId, onCopy } = props;

    return (
        <FormControl
            className={clsx(classes.margin, classes.textField)}
            variant="outlined"
        >
            <InputLabel htmlFor="outlined-adornment-link">
                {t('run.link.header')}
            </InputLabel>
            <OutlinedInput
                id={`run-link-${runId}`}
                value={`https://Lumi.run/${runId}`}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="run link"
                            edge="end"
                            onClick={() => onCopy(runId)}
                        >
                            <FileCopyIcon />
                        </IconButton>
                    </InputAdornment>
                }
                labelWidth={70}
            />
        </FormControl>
    );
}
