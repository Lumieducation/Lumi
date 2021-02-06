import React from 'react';

import CssBaseline from '@material-ui/core/CssBaseline';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import GetAppIcon from '@material-ui/icons/GetApp';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1
        },
        menuButton: {
            marginRight: theme.spacing(2)
        },
        title: {
            flexGrow: 1
        }
    })
);

declare var window: {
    lumi_xapi: any;
    H5PIntegration: {
        contents: any;
    };
};

function removeFile(obj: any) {
    for (let key in obj) {
        if (
            key === 'file' ||
            key === 'files' ||
            key === 'imageSlideBackground' ||
            key === 'background'
        ) {
            delete obj[key];
        } else if (typeof obj[key] === 'object') {
            removeFile(obj[key]);
        }
    }
}

export default function App() {
    const classes = useStyles();

    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState('');

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = () => {
        var element = document.createElement('a');

        const contentIds: string[] = Object.keys(
            window.H5PIntegration.contents
        );

        let contentJson = JSON.parse(
            window.H5PIntegration.contents[contentIds[0]].jsonContent
        );

        removeFile(contentJson);

        const library = window.H5PIntegration.contents[contentIds[0]].library;

        element.setAttribute(
            'href',
            'data:text/plain;charset=utf-8,' +
                encodeURIComponent(
                    JSON.stringify({
                        name,
                        xapi: window.lumi_xapi,
                        contentJson: contentJson,
                        library
                    })
                )
        );
        element.setAttribute('download', `${name}.lumi`);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
        setOpen(false);
    };
    return (
        <div id="lumi">
            <CssBaseline />
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" className={classes.title}>
                            Lumi
                        </Typography>
                        <IconButton
                            edge="start"
                            className={classes.menuButton}
                            color="inherit"
                            aria-label="menu"
                            onClick={handleClickOpen}
                        >
                            <GetAppIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Dialog
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">Name</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Please enter your name.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Name"
                            type="text"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyUp={(event) => {
                                if (event.key === 'Enter') {
                                    handleSubmit();
                                }
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} color="primary">
                            Ok
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}
