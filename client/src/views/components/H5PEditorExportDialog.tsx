import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { actions, IState } from '../../state';
import { truncateSync } from 'fs-extra';

export default function H5PEditorExportDialog() {
    // const { open, yesCallback, noCallback } = props;
    const open = useSelector(
        (state: IState) => state.h5peditor.showExportDialog
    );

    const dispatch = useDispatch();

    return (
        <div>
            <Dialog
                open={open}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Lumi reporter</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Do you want to include a reporter in your html? <br />
                        Learn more about it{' '}
                        <a
                            href="https://lumieducation.gitbook.io/lumi/analytics/reporter"
                            target="_blank"
                        >
                            here
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
                        No
                    </Button>
                    <Button
                        onClick={() =>
                            dispatch(actions.h5peditor.exportH5P(true))
                        }
                        color="primary"
                        autoFocus
                    >
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
