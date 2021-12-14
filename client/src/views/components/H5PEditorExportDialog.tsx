import React, { useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Switch from '@material-ui/core/Switch';

import { actions, IState } from '../../state';
import {
    Box,
    Checkbox,
    FormHelperText,
    InputAdornment,
    TextField
} from '@material-ui/core';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Stack
} from '@mui/material';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

export default function H5PEditorExportDialog() {
    const dispatch = useDispatch();
    const { t } = useTranslation('lumi');

    // State from Redux
    const open = useSelector(
        (state: IState) => state.h5peditor.showExportDialog
    );
    // Internal State
    const [formatChoice, setFormatChoice] = useState<
        'bundle' | 'external' | 'scorm'
    >('bundle');
    const [includeReporter, setIncludeReporter] = useState<boolean>(true);
    const [showRights, setShowRights] = useState<boolean>(true);
    const [showEmbed, setShowEmbed] = useState<boolean>(false);
    const [masteryScore, setMasteryScore] = useState<string>('70');
    const [masteryScoreError, setMasteryScoreError] = useState<string>();
    const [isValid, setIsValid] = useState<boolean>(true);
    const [marginX, setMarginX] = useState<string>('20');
    const [marginXError, setMarginXError] = useState<string>();
    const [marginY, setMarginY] = useState<string>('20');
    const [marginYError, setMarginYError] = useState<string>();
    const [restrictWidthAndCenter, setRestrictWidthAndCenter] =
        useState<boolean>(true);
    const [maxWidth, setMaxWidth] = useState<string>('800');
    const [maxWidthError, setMaxWidthError] = useState<string>();
    const [addCss, setAddCss] = useState<boolean>(false);
    const [cssPath, setCssPath] = useState<string>('');

    const checkAndSetNumber =
        (
            errorSetter: {
                (value: React.SetStateAction<string | undefined>): void;
                (arg0: undefined): void;
            },
            setter: {
                (value: React.SetStateAction<string>): void;
                (arg0: string): void;
            },
            min?: number,
            max?: number
        ) =>
        (event: { target: { value: string } }) => {
            const parsed = Number.parseFloat(event.target.value);
            if (isNaN(parsed)) {
                errorSetter(t('editor.exportDialog.validationErrors.errorNaN'));
                setIsValid(false);
            } else if (
                (min !== undefined && parsed < min) ||
                (max !== undefined && parsed > max)
            ) {
                let message;
                if (min !== undefined && max !== undefined) {
                    message = t(
                        'editor.exportDialog.validationErrors.errorRange',
                        {
                            min,
                            max
                        }
                    );
                } else if (min !== undefined) {
                    message = t(
                        'editor.exportDialog.validationErrors.errorRangeMin',
                        {
                            min
                        }
                    );
                } else {
                    message = t(
                        'editor.exportDialog.validationErrors.errorRangeMax',
                        {
                            max
                        }
                    );
                }
                errorSetter(message);
                setIsValid(false);
            } else {
                errorSetter(undefined);
                setIsValid(true);
            }
            setter(event.target.value);
        };

    return (
        <div>
            <Dialog
                open={open}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                onClose={() => dispatch(actions.h5peditor.cancelExportH5P())}
            >
                <DialogTitle id="alert-dialog-title">
                    {t('editor.exportDialog.title')}
                </DialogTitle>
                <DialogContent>
                    <Box paddingBottom={2}>
                        <FormControl>
                            <FormLabel>
                                {t('editor.exportDialog.format.title')}
                            </FormLabel>
                            <RadioGroup
                                name="exportformat"
                                value={formatChoice}
                                onChange={(e, val) => {
                                    if (
                                        formatChoice === 'scorm' &&
                                        val !== 'scorm' &&
                                        masteryScore === ''
                                    ) {
                                        setMasteryScore('70');
                                    }
                                    setFormatChoice(val as any);
                                }}
                            >
                                <FormControlLabel
                                    value="bundle"
                                    control={<Radio />}
                                    label={t(
                                        'editor.exportDialog.format.bundleLabel'
                                    )}
                                />
                                {formatChoice === 'bundle' && (
                                    <FormHelperText>
                                        {t(
                                            'editor.exportDialog.format.bundleHint'
                                        )}
                                    </FormHelperText>
                                )}
                                <FormControlLabel
                                    value="external"
                                    control={<Radio />}
                                    label={t(
                                        'editor.exportDialog.format.externalLabel'
                                    )}
                                />
                                {formatChoice === 'external' && (
                                    <FormHelperText>
                                        {t(
                                            'editor.exportDialog.format.externalHint'
                                        )}
                                    </FormHelperText>
                                )}
                                <FormControlLabel
                                    value="scorm"
                                    control={<Radio />}
                                    label={t(
                                        'editor.exportDialog.format.scorm.label'
                                    )}
                                />
                                {formatChoice === 'scorm' && (
                                    <Box mt={1}>
                                        <TextField
                                            style={{ width: '35ch' }}
                                            label={t(
                                                'editor.exportDialog.format.scorm.masteryScoreLabel'
                                            )}
                                            value={masteryScore}
                                            error={
                                                masteryScoreError !== undefined
                                            }
                                            helperText={masteryScoreError}
                                            variant="outlined"
                                            type="number"
                                            size="small"
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        %
                                                    </InputAdornment>
                                                )
                                            }}
                                            onChange={checkAndSetNumber(
                                                setMasteryScoreError,
                                                setMasteryScore,
                                                0,
                                                100
                                            )}
                                        />
                                    </Box>
                                )}
                            </RadioGroup>
                        </FormControl>
                    </Box>
                    <Stack paddingBottom={2}>
                        <FormControl>
                            <FormLabel>
                                {t(
                                    'editor.exportDialog.addFunctionality.title'
                                )}
                            </FormLabel>
                        </FormControl>
                        <FormControl>
                            <FormControlLabel
                                control={<Switch />}
                                checked={
                                    formatChoice !== 'scorm' && includeReporter
                                }
                                disabled={formatChoice === 'scorm'}
                                onChange={(e, checked) =>
                                    setIncludeReporter(checked)
                                }
                                name="includeReporter"
                                label={t(
                                    'editor.exportDialog.reporter.switchLabel'
                                )}
                            />
                            <FormHelperText
                                style={{
                                    marginBottom: '5px',
                                    marginLeft: '20px'
                                }}
                            >
                                {t('editor.exportDialog.reporter.hint')}{' '}
                                <a
                                    href="https://lumieducation.gitbook.io/lumi/analytics/reporter"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {t(
                                        'editor.exportDialog.reporter.learnMoreLink'
                                    )}
                                </a>
                            </FormHelperText>
                        </FormControl>
                        <FormControl>
                            <FormControlLabel
                                checked={showRights}
                                control={<Switch />}
                                label={t(
                                    'editor.exportDialog.addFunctionality.rights'
                                )}
                                onChange={(e, checked) => {
                                    setShowRights(checked);
                                }}
                                name="showRights"
                            />
                        </FormControl>
                        <FormControl>
                            <FormControlLabel
                                checked={formatChoice !== 'scorm' && showEmbed}
                                control={<Switch />}
                                disabled={formatChoice === 'scorm'}
                                label={t(
                                    'editor.exportDialog.addFunctionality.embed'
                                )}
                                onChange={(e, checked) => {
                                    setShowEmbed(checked);
                                }}
                                name="showEmbed"
                            />
                        </FormControl>
                    </Stack>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            {t('editor.exportDialog.displayOptions.title')}
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={2}>
                                    <FormControl style={{ width: '35ch' }}>
                                        <TextField
                                            label={t(
                                                'editor.exportDialog.displayOptions.marginX'
                                            )}
                                            variant="outlined"
                                            type="number"
                                            size="small"
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        {t(
                                                            'editor.exportDialog.pixelsAbbreviation'
                                                        )}
                                                    </InputAdornment>
                                                )
                                            }}
                                            error={marginXError !== undefined}
                                            helperText={marginXError}
                                            value={marginX}
                                            onChange={checkAndSetNumber(
                                                setMarginXError,
                                                setMarginX,
                                                0
                                            )}
                                        />
                                    </FormControl>
                                    <FormControl style={{ width: '35ch' }}>
                                        <TextField
                                            label={t(
                                                'editor.exportDialog.displayOptions.marginY'
                                            )}
                                            type="number"
                                            variant="outlined"
                                            size="small"
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        {t(
                                                            'editor.exportDialog.pixelsAbbreviation'
                                                        )}
                                                    </InputAdornment>
                                                )
                                            }}
                                            error={marginYError !== undefined}
                                            helperText={marginYError}
                                            value={marginY}
                                            onChange={checkAndSetNumber(
                                                setMarginYError,
                                                setMarginY,
                                                0
                                            )}
                                        />
                                    </FormControl>
                                </Stack>
                                <Stack direction="row">
                                    <FormControl>
                                        <FormControlLabel
                                            control={<Checkbox />}
                                            label={t(
                                                'editor.exportDialog.displayOptions.restrictWidthAndAlign'
                                            )}
                                            checked={restrictWidthAndCenter}
                                            onChange={(e, checked) =>
                                                setRestrictWidthAndCenter(
                                                    checked
                                                )
                                            }
                                        />
                                    </FormControl>
                                    <FormControl style={{ width: '25ch' }}>
                                        <TextField
                                            label={t(
                                                'editor.exportDialog.displayOptions.maximumWidth'
                                            )}
                                            variant="outlined"
                                            type="number"
                                            size="small"
                                            disabled={!restrictWidthAndCenter}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        {t(
                                                            'editor.exportDialog.pixelsAbbreviation'
                                                        )}
                                                    </InputAdornment>
                                                )
                                            }}
                                            error={maxWidthError !== undefined}
                                            helperText={maxWidthError}
                                            value={maxWidth}
                                            onChange={checkAndSetNumber(
                                                setMaxWidthError,
                                                setMaxWidth,
                                                0
                                            )}
                                        />
                                    </FormControl>
                                </Stack>
                                <Stack direction="row" alignItems="center">
                                    <FormControl>
                                        <FormControlLabel
                                            control={<Checkbox />}
                                            label={t(
                                                'editor.exportDialog.displayOptions.addCss'
                                            )}
                                            checked={addCss}
                                            onChange={(e, checked) =>
                                                setAddCss(checked)
                                            }
                                        />
                                    </FormControl>
                                    <FormHelperText>filename</FormHelperText>
                                    <Box flexGrow="1" />
                                    <Button disabled={!addCss} size="small">
                                        {t(
                                            'editor.exportDialog.displayOptions.chooseCssFile'
                                        )}
                                    </Button>
                                </Stack>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() =>
                            dispatch(actions.h5peditor.cancelExportH5P())
                        }
                    >
                        {t('editor.exportDialog.cancelButton')}
                    </Button>
                    <Button
                        color="primary"
                        autoFocus
                        onClick={() =>
                            dispatch(
                                actions.h5peditor.exportH5P(
                                    formatChoice !== 'scorm'
                                        ? includeReporter
                                        : false,
                                    formatChoice,
                                    {
                                        showRights,
                                        masteryScore:
                                            formatChoice === 'scorm'
                                                ? masteryScore
                                                : undefined,
                                        showEmbed:
                                            formatChoice === 'scorm'
                                                ? false
                                                : showEmbed
                                    }
                                )
                            )
                        }
                        disabled={!isValid}
                    >
                        {t('editor.exportDialog.exportButton')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
