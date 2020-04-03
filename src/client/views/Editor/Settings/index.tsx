import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import { TransitionProps } from '@material-ui/core/transitions';
import Grid, { GridSpacing } from '@material-ui/core/Grid';
import Drawer from '@material-ui/core/Drawer';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import SecurityIcon from '@material-ui/icons/Security';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        appBar: {
            position: 'relative'
        },
        title: {
            marginLeft: theme.spacing(2),
            flex: 1
        }
    })
);

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function FullScreenDialog(): JSX.Element {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <Dialog
            fullScreen={true}
            open={true}
            onClose={handleClose}
            TransitionComponent={Transition}
        >
            <AppBar className={classes.appBar}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
                        Settings
                    </Typography>
                    <Button
                        autoFocus={true}
                        color="inherit"
                        onClick={handleClose}
                    >
                        save
                    </Button>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="persistent"
                anchor={'left'}
                open={true}
                style={{ position: 'fixed' }}
            >
                <List style={{ marginTop: '64px', width: '200px' }}>
                    <ListItem button={true}>
                        <ListItemIcon>{<SecurityIcon />}</ListItemIcon>
                        <ListItemText primary="Privacy" />
                    </ListItem>
                    <Divider />
                </List>
            </Drawer>
            <Grid container={true} spacing={2}>
                <Grid item={true} xs={12}>
                    <Grid container={true} justify="center">
                        <Grid item={true} xs={3}></Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Dialog>
    );
}
