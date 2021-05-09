import React from 'react';

import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import RunSetupDialog from '../components/RunSetupDialog';

import { actions, IState } from '../../state';

export default function RunSetupDialogContainer() {
    const dispatch = useDispatch();
    const history = useHistory();

    const { t } = useTranslation();
    const open = useSelector((state: IState) => state.run.showSetupDialog);
    const email = useSelector((state: IState) => state.settings.email);

    const onClose = () => {
        history.push('/');
        dispatch(actions.run.updateState({ showSetupDialog: false }));
    };
    const onConsent = () => {
        dispatch(actions.run.updateState({ showSetupDialog: false }));
    };

    return (
        <RunSetupDialog
            open={open}
            onClose={onClose}
            onConsent={onConsent}
            email={email}
            loggedIn={Boolean(email)}
            handleLogin={(email: string, token: string) => {
                dispatch(actions.settings.changeSetting({ email, token }));
                dispatch(
                    actions.notifications.notify(
                        t('auth.notification.login.success', {
                            email
                        }),
                        'success'
                    )
                );
            }}
            handleLogout={() => {
                dispatch(
                    actions.settings.changeSetting({
                        email: undefined,
                        token: undefined
                    })
                );
                dispatch(
                    actions.notifications.notify(
                        t('auth.notification.logout.success'),
                        'success'
                    )
                );
            }}
        />
    );
}
