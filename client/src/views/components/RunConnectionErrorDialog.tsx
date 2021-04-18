import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement<any, any> },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function RunConnectionErrorDialog(props: {
    open: boolean;
    close: () => void;
}) {
    const { t } = useTranslation();

    return (
        <Dialog
            open={props.open}
            TransitionComponent={Transition}
            keepMounted
            onClose={props.close}
            aria-labelledby="runconnectionerrordialog-title"
            aria-describedby="runconnectionerrordialog-description"
        >
            <DialogTitle id="runconnectionerrordialog-title">
                {t('run.dialog.error.title')}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="runconnectionerrordialog-description">
                    {t('run.dialog.error.description')}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.close} color="primary">
                    {t('run.dialog.error.ok')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
