import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';

import RunUploadDialog from '../components/RunUploadDialog';

import { actions, IState } from '../../state';

export default function RunSetupDialogContainer() {
    const dispatch = useDispatch();
    const history = useHistory();
    const { t } = useTranslation();

    const open = useSelector((state: IState) => state.run.showUploadDialog);

    const uploadProgress = useSelector(
        (state: IState) => state.run.uploadProgress
    );

    const goToRun = () => {
        dispatch(actions.run.updateState({ showUploadDialog: false }));
        history.push('/run');
    };

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

    const onClose = () => {
        dispatch(
            actions.run.updateState({
                showUploadDialog: false
            })
        );
    };

    return (
        <RunUploadDialog
            open={open}
            goToRun={goToRun}
            uploadProgress={uploadProgress}
            onCopy={onCopy}
            onClose={onClose}
        />
    );
}
