import React from 'react';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';

interface IProps {
    cancel: () => void;
    create: (name: string) => void;
    path: string;
    type: 'file' | 'directory';
}
export default function CreateFileDialog(props: IProps): JSX.Element {
    const [value, setValue] = React.useState();

    const change = (event: any) => {
        setValue(event.target.value);
    };

    return (
        <Dialog open={true} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">
                Create new {props.type}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Create a new {props.type} at {props.path}
                </DialogContentText>
                <TextField
                    autoFocus={true}
                    margin="dense"
                    id="name"
                    label="Name"
                    onChange={change}
                    value={value}
                    fullWidth={true}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.cancel} color="primary">
                    Cancel
                </Button>
                <Button onClick={() => props.create(value)} color="primary">
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    );
}
