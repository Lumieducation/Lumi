import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { actions, IState } from '../../state';

export default function H5PEditorExportDialog() {
    // const { open, yesCallback, noCallback } = props;
    const open = useSelector(
        (state: IState) => state.h5peditor.showExportDialog
    );

    const dispatch = useDispatch();
    const { t } = useTranslation();

    return (
        <div>
            <Dialog
                open={open}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {t('notifications.export_as_html.dialog.title')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {t('notifications.export_as_html.dialog.description')}
                        <a
                            href="https://lumieducation.gitbook.io/lumi/analytics/reporter"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {t('notifications.export_as_html.dialog.here')}
                        </a>
                        .
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() =>
                            dispatch(actions.h5peditor.exportH5P(false))
                        }
                        color="primary"
                    >
                        {t('notifications.export_as_html.dialog.no')}
                    </Button>
                    <Button
                        onClick={() =>
                            dispatch(actions.h5peditor.exportH5P(true))
                        }
                        color="primary"
                        autoFocus
                    >
                        {t('notifications.export_as_html.dialog.yes')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
