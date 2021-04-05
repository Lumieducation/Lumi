import React, { useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
// import { useTranslation } from 'react-i18next';

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
import { Box, FormHelperText, TextField } from '@material-ui/core';

export default function H5PEditorExportDialog() {
    // const { open, yesCallback, noCallback } = props;
    const open = useSelector(
        (state: IState) => state.h5peditor.showExportDialog
    );

    const [formatChoice, setFormatChoice] = useState<
        'bundle' | 'external' | 'scorm'
    >('bundle');
    const [includeReporter, setIncludeReporter] = useState<boolean>(true);
    const [masteryScore, setMasteryScore] = useState<string>('70');
    const [masteryScoreError, setMasteryScoreError] = useState<string>();
    const [isValid, setIsValid] = useState<boolean>(true);

    const dispatch = useDispatch();
    // const { t } = useTranslation();

    return (
        <div>
            <Dialog
                open={open}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                onClose={() => dispatch(actions.h5peditor.cancelExportH5P())}
            >
                <DialogTitle id="alert-dialog-title">
                    Export settings
                </DialogTitle>
                <DialogContent>
                    <Box paddingBottom={4}>
                        <FormControl>
                            <FormLabel>Format</FormLabel>
                            <RadioGroup
                                name="exportformat"
                                value={formatChoice}
                                onChange={(e, val) =>
                                    setFormatChoice(val as any)
                                }
                            >
                                <FormControlLabel
                                    value="bundle"
                                    control={<Radio />}
                                    label="All-in-one HTML file"
                                />
                                {formatChoice === 'bundle' && (
                                    <FormHelperText>
                                        The file can grow too big for some
                                        computers if you include lots of media
                                        files.
                                    </FormHelperText>
                                )}
                                <FormControlLabel
                                    value="external"
                                    control={<Radio />}
                                    label="One HTML file and several media files"
                                />
                                {formatChoice === 'external' && (
                                    <FormHelperText>
                                        You will be asked for a name for the
                                        HTML file in the next step. The media
                                        files will be put into folders that
                                        start with the same name as the file.
                                    </FormHelperText>
                                )}
                                <FormControlLabel
                                    value="scorm"
                                    control={<Radio />}
                                    label="SCORM package"
                                />
                                {formatChoice === 'scorm' && (
                                    <Box marginLeft={2}>
                                        <TextField
                                            label="Mastery score (in %)"
                                            value={masteryScore}
                                            error={
                                                masteryScoreError !== undefined
                                            }
                                            helperText={masteryScoreError}
                                            onChange={(event) => {
                                                const parsed = Number.parseFloat(
                                                    event.target.value
                                                );
                                                if (isNaN(parsed)) {
                                                    setMasteryScoreError(
                                                        'Entered value is not a number'
                                                    );
                                                    setIsValid(false);
                                                } else if (
                                                    parsed < 0 ||
                                                    parsed > 100
                                                ) {
                                                    setMasteryScoreError(
                                                        'The value must be between 0 and 100'
                                                    );
                                                    setIsValid(false);
                                                } else {
                                                    setMasteryScoreError(
                                                        undefined
                                                    );
                                                    setIsValid(true);
                                                }
                                                setMasteryScore(
                                                    event.target.value
                                                );
                                            }}
                                        />
                                    </Box>
                                )}
                            </RadioGroup>
                        </FormControl>
                    </Box>
                    <Box>
                        <FormControl>
                            <FormLabel>Reporter</FormLabel>
                            <FormHelperText>
                                If you add the reporter, students can save a
                                file with their progress and send it to you.
                                <a
                                    href="https://lumieducation.gitbook.io/lumi/analytics/reporter"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Learn more about it here.
                                </a>
                            </FormHelperText>
                            <FormControlLabel
                                control={<Switch />}
                                checked={
                                    formatChoice === 'scorm'
                                        ? false
                                        : includeReporter
                                }
                                onChange={(e, checked) =>
                                    setIncludeReporter(checked)
                                }
                                disabled={formatChoice === 'scorm'}
                                name="includeReporter"
                                label="Include reporter"
                            />
                            {formatChoice === 'scorm' && (
                                <FormHelperText>
                                    The reporter cannot be added to SCORM
                                    packages.
                                </FormHelperText>
                            )}
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() =>
                            dispatch(actions.h5peditor.cancelExportH5P())
                        }
                    >
                        Cancel
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
                                        masteryScore:
                                            formatChoice === 'scorm'
                                                ? masteryScore
                                                : undefined
                                    }
                                )
                            )
                        }
                        disabled={formatChoice === 'scorm' && !isValid}
                    >
                        Export now
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
