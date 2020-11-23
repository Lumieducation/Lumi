import React from 'react';

import { makeStyles, Theme } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';

import { Modes } from 'state/ui/types';

function a11yProps(index: any): { 'aria-controls': string; id: string } {
    return {
        'aria-controls': `vertical-tabpanel-${index}`,
        id: `vertical-tab-${index}`
    };
}

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        display: 'fixed',
        flexGrow: 1
    }
}));

export default function VerticalTabs(props: {
    changeMode: (mode: Modes) => void;
    mode: Modes;
}): JSX.Element {
    const { changeMode, mode } = props;
    const classes = useStyles();

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        changeMode(newValue);
    };

    return (
        <div className={classes.root}>
            <Tabs value={mode} onChange={handleChange} variant="fullWidth">
                <Tab
                    label={
                        <div>
                            <VisibilityOutlinedIcon
                                style={{ verticalAlign: 'middle' }}
                            />{' '}
                            View
                        </div>
                    }
                    {...a11yProps(0)}
                />
                <Tab
                    label={
                        <div>
                            <EditOutlinedIcon
                                style={{ verticalAlign: 'middle' }}
                            />{' '}
                            Edit
                        </div>
                    }
                    {...a11yProps(1)}
                />
            </Tabs>
        </div>
    );
}
