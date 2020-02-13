import React from 'react';

import IconButton from '@material-ui/core/IconButton';
import { makeStyles, Theme } from '@material-ui/core/styles';

import NewFileIcon from '@material-ui/icons/AddBox';
import NewFolderIcon from '@material-ui/icons/CreateNewFolder';
import RefreshIcon from '@material-ui/icons/Refresh';

import CreateFileDialog from './CreateFileDialog';

export default function Toolbar(props: {
    createDirectory: (name: string) => void;
    createFile: (name: string) => void;
    currentDirectory: string;
    refresh: () => void;
}): JSX.Element {
    const { currentDirectory } = props;
    const [newFileDialog, showNewFileDialog] = React.useState(false);
    const [newDirectoryDialog, showNewDirectoryDialog] = React.useState(false);

    const classes = useStyles();

    return (
        <div className={classes.drawerHeader}>
            <IconButton onClick={() => showNewFileDialog(true)}>
                <NewFileIcon />
            </IconButton>
            <IconButton onClick={() => showNewDirectoryDialog(true)}>
                <NewFolderIcon />
            </IconButton>
            <IconButton onClick={props.refresh}>
                <RefreshIcon />
            </IconButton>
            {newFileDialog ? (
                <CreateFileDialog
                    type="file"
                    path={currentDirectory}
                    cancel={() => showNewFileDialog(false)}
                    create={(name: string) => {
                        props.createFile(name);
                        showNewFileDialog(false);
                    }}
                />
            ) : null}
            {newDirectoryDialog ? (
                <CreateFileDialog
                    type="directory"
                    path={currentDirectory}
                    cancel={() => showNewDirectoryDialog(false)}
                    create={(name: string) => {
                        props.createDirectory(name);
                        showNewDirectoryDialog(false);
                    }}
                />
            ) : null}
        </div>
    );
}

const useStyles = makeStyles((theme: Theme) => {
    return {
        drawerHeader: {
            alignItems: 'center',
            display: 'flex',
            padding: theme.spacing(0, 1),
            ...theme.mixins.toolbar,
            justifyContent: 'flex-end'
        }
    };
});
