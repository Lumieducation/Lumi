import React from 'react';
import { useTranslation } from 'react-i18next';

import clsx from 'clsx';
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
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import superagent from 'superagent';

import Logo from './Logo';

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
        error: {
            background: 'linear-gradient(45deg, #e67e22 0%, #e74c3c 100%)'
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

export interface IAuthProps {
    loggedIn: boolean;
    handleLogout: () => void;
    handleLogin: (email: string, token: string) => void;
}
export default function Auth(props: IAuthProps): JSX.Element {
    const classes = useStyles();
    const { t } = useTranslation();

    const { loggedIn, handleLogin, handleLogout } = props;

    const [open, setOpen] = React.useState(false);
    const [email, setEmail] = React.useState('');
    const [enterCode, setEnterCode] = React.useState(false);
    const [code, setCode] = React.useState('');
    const [error, setError] = React.useState(false);
    const [message, setMessage] = React.useState('');

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEnterCode(false);
    };

    const changeEmail = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setError(false);
        setMessage('');
    };

    const handleError = async (error: superagent.ResponseError) => {
        try {
            const { status } = error;

            switch (status) {
                case 500:
                    setMessage('auth.error.econnrefused');
                    setError(true);

                    break;
                default:
                    handleLogout();
            }
        } catch (error: any) {
            setError(true);
            setMessage('auth.something_went_wrong');
        }
    };

    const handleSendCode = async () => {
        setError(false);
        setMessage('');
        const validateEmail =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                String(email).toLowerCase()
            );

        if (!validateEmail) {
            setMessage('auth.error.no-valid-email');
            setError(true);
            return;
        }
        try {
            await superagent
                .post(`/api/v1/auth/api/v1/auth/register`)
                .send({ email });
            setMessage('auth.notification.pending');
            setEnterCode(true);
        } catch (error: any) {
            handleError(error);
        }
    };

    const handleVerification = async () => {
        try {
            const { body } = await superagent
                .post(`/api/v1/auth/api/v1/auth/login`)
                .send({
                    code
                });

            setOpen(false);
            handleLogin(email, body.token);
        } catch (error: any) {
            handleError(error);
        }
    };

    return (
        <div>
            {loggedIn ? (
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleLogout}
                >
                    {t('auth.logout')}
                </Button>
            ) : (
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleClickOpen}
                >
                    {t('auth.set_email')}
                </Button>
            )}

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
            >
                <DialogContent
                    className={clsx({
                        [classes.bg]: !error,
                        [classes.error]: error
                    })}
                >
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
                                    onChange={changeEmail}
                                />
                                <Grid item xs={12}>
                                    <div>{t(message, { email })}</div>
                                </Grid>
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
                        {t('auth.cancel')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
