import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';

import { actions, IState } from '../../state';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function ErrorDialog() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const open = useSelector(
        (state: IState) => state.notifications.showErrorDialog
    );

    const code = useSelector(
        (state: IState) => state.notifications.error?.code
    );

    const message = useSelector(
        (state: IState) => state.notifications.error?.message
    );

    const redirect = useSelector(
        (state: IState) => state.notifications.error.redirect
    );

    const close = () => {
        dispatch(actions.notifications.closeErrorDialog());

        if (redirect) {
            navigate(redirect);
        }
    };

    return (
        <Dialog
            open={open}
            TransitionComponent={Transition}
            keepMounted
            onClose={close}
            aria-labelledby="errordialog-title"
            aria-describedby="errordialog-description"
        >
            <DialogTitle id="errorialog-title">{t(code)}</DialogTitle>
            <DialogContent>
                <DialogContentText id="errordialog-description">
                    {t(message)}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={close} color="primary">
                    {t('run.dialog.error.ok')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
