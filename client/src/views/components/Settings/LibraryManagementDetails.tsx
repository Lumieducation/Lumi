import React from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import CircularProgress from '@material-ui/core/CircularProgress';

import CheckIcon from '@material-ui/icons/Check';
import CrossIcon from '@material-ui/icons/Close';

import type { IInstalledLibrary } from '@lumieducation/h5p-server';

const yesNo = (value: undefined | boolean | 0 | 1) =>
    value ? <CheckIcon /> : <CrossIcon />;

export interface SimpleDialogProps {
    open: boolean;
    // selectedValue: string;
    onClose: () => void;
    details?: IInstalledLibrary & {
        dependentsCount: number;
        instancesAsDependencyCount: number;
        instancesCount: number;
        isAddon: boolean;
    };
}

function LibraryDetailDialog(props: SimpleDialogProps) {
    const { t } = useTranslation();
    const { onClose, open } = props;

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog
            onClose={handleClose}
            aria-labelledby="simple-dialog-title"
            open={open}
        >
            <DialogTitle id="simple-dialog-title">
                {t(
                    'settings.h5p-library-administration.library-details.header'
                )}
            </DialogTitle>
            <div>
                {props.details === undefined ? (
                    <div style={{ display: 'flex', padding: '20px' }}>
                        <CircularProgress
                            style={{
                                margin: 'auto'
                                // display: 'block'
                            }}
                        />
                    </div>
                ) : (
                    <div>
                        <div>
                            <TableContainer component={Paper}>
                                <Table aria-label="simple table">
                                    <TableBody>
                                        <TableRow>
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {t(
                                                    'settings.h5p-library-administration.library-details.author'
                                                )}
                                            </TableCell>{' '}
                                            <TableCell align="right">
                                                {props.details.author || '-'}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {t(
                                                    'settings.h5p-library-administration.library-details.description'
                                                )}
                                            </TableCell>{' '}
                                            <TableCell align="right">
                                                {props.details.description ||
                                                    '-'}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {t(
                                                    'settings.h5p-library-administration.library-details.license'
                                                )}
                                            </TableCell>{' '}
                                            <TableCell align="right">
                                                {props.details.license || '-'}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {t(
                                                    'settings.h5p-library-administration.library-details.standalone'
                                                )}
                                            </TableCell>{' '}
                                            <TableCell align="right">
                                                {yesNo(props.details.runnable)}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {t(
                                                    'settings.h5p-library-administration.library-details.restricted'
                                                )}
                                            </TableCell>{' '}
                                            <TableCell align="right">
                                                {yesNo(
                                                    props.details.restricted
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {t(
                                                    'settings.h5p-library-administration.library-details.fullscreen'
                                                )}
                                            </TableCell>{' '}
                                            <TableCell align="right">
                                                {yesNo(
                                                    props.details.fullscreen
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {t(
                                                    'settings.h5p-library-administration.library-details.addon'
                                                )}
                                            </TableCell>{' '}
                                            <TableCell align="right">
                                                {yesNo(props.details.isAddon)}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {t(
                                                    'settings.h5p-library-administration.library-details.embedTypes'
                                                )}
                                            </TableCell>{' '}
                                            <TableCell align="right">
                                                {props.details.embedTypes?.join(
                                                    ' '
                                                ) || '-'}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {t(
                                                    'settings.h5p-library-administration.library-details.dependentsCount'
                                                )}
                                            </TableCell>{' '}
                                            <TableCell align="right">
                                                {props.details.dependentsCount}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {t(
                                                    'settings.h5p-library-administration.library-details.instancesCount'
                                                )}
                                            </TableCell>{' '}
                                            <TableCell align="right">
                                                {props.details.instancesCount}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                component="th"
                                                scope="row"
                                            >
                                                {t(
                                                    'settings.h5p-library-administration.library-details.instancesAsDependencyCount'
                                                )}
                                            </TableCell>{' '}
                                            <TableCell align="right">
                                                {
                                                    props.details
                                                        .instancesAsDependencyCount
                                                }
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    </div>
                )}
            </div>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    {t('dialog.close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function LibraryManagementDetailsDialog(props: {
    details?: IInstalledLibrary & {
        dependentsCount: number;
        instancesAsDependencyCount: number;
        instancesCount: number;
        isAddon: boolean;
    };
    showDetails: () => void;
}) {
    const { t } = useTranslation();
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        props.showDetails();
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <Button
                variant="contained"
                color="primary"
                onClick={handleClickOpen}
            >
                {t('settings.h5p-library-administration.details')}
            </Button>
            <LibraryDetailDialog
                details={props.details}
                open={open}
                onClose={handleClose}
            />
        </div>
    );
}
