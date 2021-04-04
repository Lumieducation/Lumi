import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import {
    withStyles,
    makeStyles,
    createStyles,
    Theme
} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import CssBaseline from '@material-ui/core/CssBaseline';

import Container from '@material-ui/core/Container';

import superagent from 'superagent';

import Logo from './components/Logo';

import { actions, IState } from '../state';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            width: '100%',
            padding: '50px'
        },
        bg: {
            background: 'linear-gradient(45deg, #1abc9c 0%, #3498db 100%)'
        },
        paper: {
            marginTop: theme.spacing(8),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        },
        avatar: {
            margin: theme.spacing(1),
            backgroundColor: theme.palette.secondary.main
        },
        form: {
            width: '100%', // Fix IE 11 issue.
            marginTop: theme.spacing(1)
        },
        submit: {
            margin: theme.spacing(3, 0, 2)
        }
    })
);

const CssTextField = withStyles({
    root: {
        '& label.Mui-focused': {
            color: 'white'
        },
        '& .MuiInput-underline:after': {
            borderBottomColor: 'white'
        },
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'white'
            },
            '&:hover fieldset': {
                borderColor: 'white'
            },
            '&.Mui-focused fieldset': {
                borderColor: 'white'
            }
        }
    }
})(TextField);

export default function FormDialog() {
    const classes = useStyles();
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [open, setOpen] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [enterCode, setEnterCode] = React.useState(false);
    const [code, setCode] = React.useState('');

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEnterCode(false);
    };

    const handleSendCode = async () => {
        await superagent.post(`/api/v1/auth/register`).send({ email });
        setEnterCode(true);
    };

    const handleVerification = async () => {
        const { body } = await superagent.post(`/api/v1/auth/login`).send({
            code
        });

        dispatch(actions.settings.changeSetting({ email, token: body.token }));
    };

    return (
        <div>
            <Button
                variant="outlined"
                color="primary"
                onClick={handleClickOpen}
            >
                Open Auth
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogContent className={classes.bg}>
                    <Container component="main" maxWidth="xs">
                        <CssBaseline />
                        <div className={classes.paper}>
                            <Logo />
                            {/* <Typography component="h1" variant="h5">
                                Sign in
                            </Typography> */}
                            <div className={classes.form}>
                                <CssTextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label={t('auth.email')}
                                    name="email"
                                    autoComplete="email"
                                    disabled={enterCode}
                                    autoFocus={true}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {enterCode ? (
                                    <CssTextField
                                        variant="outlined"
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="code"
                                        label={t('auth.code')}
                                        name="email"
                                        autoFocus={true}
                                        value={code}
                                        onChange={(e) =>
                                            setCode(e.target.value)
                                        }
                                    />
                                ) : null}
                                {enterCode ? (
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        color="default"
                                        className={classes.submit}
                                        onClick={handleVerification}
                                    >
                                        {t('auth.verify_code')}
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        color="default"
                                        className={classes.submit}
                                        onClick={handleSendCode}
                                    >
                                        {t('auth.verify_email')}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Container>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        {t('cancel')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
