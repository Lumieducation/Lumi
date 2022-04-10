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
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Checkbox,
    FormHelperText,
    InputAdornment,
    TextField
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { actions, IState, selectors } from '../../state';
import { getDefaultContentTypeWidth } from '../../helpers/contentTypeWidths';
import { pickCSSFile, Result } from '../../services/FilesAPI';

export default function H5PEditorExportDialog() {
    const dispatch = useDispatch();
    const { t } = useTranslation('lumi');

    // State from Redux
    const open = useSelector(
        (state: IState) => state.h5peditor.showExportDialog
    );
    const currentTab = useSelector((state: IState) =>
        selectors.h5peditor.activeTab(state)
    );
    const autoMaxWidth = currentTab
        ? getDefaultContentTypeWidth(currentTab.mainLibrary)
        : 800;

    // Internal State
    const [formatChoice, setFormatChoice] = useState<
        'bundle' | 'external' | 'scorm'
    >('bundle');
    const [includeReporter, setIncludeReporter] = useState<boolean>(false);
    const [showRights, setShowRights] = useState<boolean>(true);
    const [showEmbed, setShowEmbed] = useState<boolean>(false);
    const [masteryScore, setMasteryScore] = useState<string>('70');
    const [masteryScoreError, setMasteryScoreError] = useState<string>();
    const [marginX, setMarginX] = useState<string>('20');
    const [marginXError, setMarginXError] = useState<string>();
    const [marginY, setMarginY] = useState<string>('20');
    const [marginYError, setMarginYError] = useState<string>();
    const [restrictWidthAndCenter, setRestrictWidthAndCenter] =
        useState<boolean>(true);
    const [maxWidth, setMaxWidth] = useState<string>(autoMaxWidth.toString());
    const [defaultMaxWidth, setDefaultMaxWidth] =
        useState<number>(autoMaxWidth);
    const [maxWidthError, setMaxWidthError] = useState<string>();
    const [addCss, setAddCss] = useState<boolean>(false);
    const [cssFilename, setCssFilename] = useState<string>('');
    const [cssFileHandleId, setCssFileHandleId] = useState<string>('');

    if (autoMaxWidth !== defaultMaxWidth) {
        setDefaultMaxWidth(autoMaxWidth);
        setMaxWidth(autoMaxWidth.toString());
    }

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
            } else {
                errorSetter(undefined);
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
                    <Box
                        paddingBottom={2}
                        display="flex"
                        flexDirection="column"
                    >
                        <FormControl>
                            <FormLabel>
                                {t(
                                    'editor.exportDialog.addFunctionality.title'
                                )}
                            </FormLabel>
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
                    </Box>
                    {!includeReporter && (
                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                {t('editor.exportDialog.displayOptions.title')}
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box style={{ width: '100%' }}>
                                    <Box display="flex" flexDirection="row">
                                        <FormControl style={{ width: '35ch' }}>
                                            <Box marginRight={2}>
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
                                                    error={
                                                        marginXError !==
                                                        undefined
                                                    }
                                                    helperText={marginXError}
                                                    value={marginX}
                                                    onChange={checkAndSetNumber(
                                                        setMarginXError,
                                                        setMarginX,
                                                        0
                                                    )}
                                                />
                                            </Box>
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
                                                error={
                                                    marginYError !== undefined
                                                }
                                                helperText={marginYError}
                                                value={marginY}
                                                onChange={checkAndSetNumber(
                                                    setMarginYError,
                                                    setMarginY,
                                                    0
                                                )}
                                            />
                                        </FormControl>
                                    </Box>
                                    <Box
                                        display="flex"
                                        flexDirection="row"
                                        marginTop={2}
                                    >
                                        <FormControl>
                                            <Box marginRight={2}>
                                                <FormControlLabel
                                                    control={<Checkbox />}
                                                    label={t(
                                                        'editor.exportDialog.displayOptions.restrictWidthAndAlign'
                                                    )}
                                                    checked={
                                                        restrictWidthAndCenter
                                                    }
                                                    onChange={(e, checked) =>
                                                        setRestrictWidthAndCenter(
                                                            checked
                                                        )
                                                    }
                                                />
                                            </Box>
                                        </FormControl>
                                        <FormControl style={{ width: '25ch' }}>
                                            <TextField
                                                label={t(
                                                    'editor.exportDialog.displayOptions.maximumWidth'
                                                )}
                                                variant="outlined"
                                                type="number"
                                                size="small"
                                                disabled={
                                                    !restrictWidthAndCenter
                                                }
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            {t(
                                                                'editor.exportDialog.pixelsAbbreviation'
                                                            )}
                                                        </InputAdornment>
                                                    )
                                                }}
                                                error={
                                                    maxWidthError !== undefined
                                                }
                                                helperText={maxWidthError}
                                                value={maxWidth}
                                                onChange={checkAndSetNumber(
                                                    setMaxWidthError,
                                                    setMaxWidth,
                                                    0
                                                )}
                                            />
                                        </FormControl>
                                    </Box>
                                    <Box
                                        display="flew"
                                        flexDirection="row"
                                        alignItems="center"
                                    >
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
                                        <FormHelperText disabled={!addCss}>
                                            {cssFilename}
                                        </FormHelperText>
                                        <Box flexGrow="1" />
                                        <Button
                                            disabled={!addCss}
                                            size="small"
                                            onClick={async () => {
                                                try {
                                                    const res =
                                                        await pickCSSFile();
                                                    if (
                                                        res.status ===
                                                            Result.Success &&
                                                        res.fileHandleId &&
                                                        res.filename
                                                    ) {
                                                        setCssFileHandleId(
                                                            res.fileHandleId
                                                        );
                                                        setCssFilename(
                                                            res.filename
                                                        );
                                                    }
                                                } catch (error: any) {}
                                            }}
                                        >
                                            {t(
                                                'editor.exportDialog.displayOptions.chooseCssFile'
                                            )}
                                        </Button>
                                    </Box>
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    )}
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
                                        restrictWidthAndCenter,
                                        cssFileHandleId,
                                        addCss,
                                        masteryScore:
                                            formatChoice === 'scorm'
                                                ? masteryScore
                                                : undefined,
                                        marginX: Number.parseInt(marginX, 10),
                                        marginY: Number.parseInt(marginY, 10),
                                        maxWidth: Number.parseInt(maxWidth, 10),
                                        showEmbed:
                                            formatChoice === 'scorm'
                                                ? false
                                                : showEmbed
                                    }
                                )
                            )
                        }
                        disabled={
                            masteryScoreError !== undefined ||
                            marginXError !== undefined ||
                            marginYError !== undefined ||
                            maxWidthError !== undefined
                        }
                    >
                        {t('editor.exportDialog.exportButton')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
