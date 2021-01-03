import clsx from 'clsx';
import React from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import { makeStyles, Theme } from '@material-ui/core/styles';

import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import SaveIcon from '@material-ui/icons/Save';
import { SaveButtonState } from '../../state/H5PEditor/H5PEditorTypes';

export default function SaveButton(props: {
    onClick: () => void;
    state: SaveButtonState;
}): JSX.Element {
    const classes = useStyles();

    const buttonClassname = clsx({
        [classes.buttonSuccess]: props.state === 'success',
        [classes.buttonError]: props.state === 'error',
        [classes.buttonPending]: props.state === 'loading'
    });

    const handleButtonClick = () => {
        // if (!props.state) {
        props.onClick();
        // }
    };

    return (
        <div
            className={classes.wrapper}
            style={{ display: props.state === 'hidden' ? 'none' : 'block' }}
        >
            <Fab
                aria-label="save"
                color="primary"
                className={buttonClassname}
                onClick={handleButtonClick}
            >
                {(() => {
                    switch (props.state) {
                        case 'success':
                            return <CheckIcon />;

                        case 'error':
                            return <CloseIcon />;

                        case 'loading':
                        default:
                            return <SaveIcon />;
                    }
                })()}
            </Fab>
            {props.state === 'loading' && (
                <CircularProgress size={68} className={classes.fabProgress} />
            )}
        </div>
    );
}

const useStyles = makeStyles((theme: Theme) => {
    return {
        buttonError: {
            '&:hover': {
                backgroundColor: `${theme.palette.error.main}`
            },
            backgroundColor: `${theme.palette.error.main}`
        },
        buttonPending: {
            '&:hover': {
                backgroundColor: '#e67e22'
            },
            backgroundColor: '#e67e22'
        },
        buttonSuccess: {
            '&:hover': {
                backgroundColor: '#27ae60'
            },
            backgroundColor: '#27ae60'
        },
        fabProgress: {
            color: '#e67e22',
            left: -6,
            position: 'absolute',
            top: -6,
            zIndex: 1
        },
        wrapper: {
            bottom: theme.spacing(2),
            position: 'fixed',
            right: theme.spacing(2)
        }
    };
});
