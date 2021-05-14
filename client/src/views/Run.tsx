import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import RunList from './components/RunList';

import { RUN_GET_RUNS_ERROR, RUN_NOT_AUTHORIZED } from '../state/Run/RunTypes';
import { actions, IState } from '../state';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            marginTop: '64px',
            backgroundColor: theme.palette.background.paper,
            display: 'flex'
        },
        link: {
            minWidth: '280px'
        },
        center: {
            margin: 'auto'
        },
        uploadButton: {
            margin: '24px'
        }
    })
);

export default function RunContainer() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const runs = useSelector((state: IState) => state.run.runs);

    useEffect(() => {
        dispatch(actions.run.getRuns()).then((action: any) => {
            if (action.type === RUN_NOT_AUTHORIZED) {
                dispatch(actions.run.updateState({ showSetupDialog: true }));
            }
            if (action.type === RUN_GET_RUNS_ERROR) {
                dispatch(
                    actions.notifications.showErrorDialog(
                        'errors.codes.econnrefused',
                        'run.dialog.error.description',
                        '/'
                    )
                );
            }
        });
    }, [dispatch]);

    const onCopy = (runId: string) => {
        navigator.clipboard.writeText(`https://Lumi.run/${runId}`);
        dispatch(
            actions.notifications.notify(
                t('general.copyClipboard', {
                    value: `https://Lumi.run/${runId}`
                }),
                'success'
            )
        );
    };

    const onDelete = (runId: string) => {
        dispatch(actions.run.deleteFromRun(runId));
    };

    return (
        <div>
            <RunList runs={runs} onDelete={onDelete} onCopy={onCopy} />

            <Grid container={true} spacing={2} justify="center">
                <Grid item={true}>
                    <Button
                        className={classes.uploadButton}
                        id="editor-startpage-primaryButton"
                        onClick={() => {
                            dispatch(actions.run.upload());
                        }}
                        variant="contained"
                        color="primary"
                        startIcon={<CloudUploadIcon />}
                    >
                        {t('run.upload')}
                    </Button>
                </Grid>
            </Grid>
        </div>
    );
}
