import React from 'react';

import { makeStyles, Theme } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import { Modes } from '../ui/types';

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
    },
    tabs: {
        borderLeft: `1px solid ${theme.palette.divider}`
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
            <Tabs
                orientation="vertical"
                variant="scrollable"
                value={mode}
                onChange={handleChange}
                aria-label="Vertical tabs example"
                className={classes.tabs}
            >
                <Tab label="View" {...a11yProps(0)} />
                <Tab label="Edit" {...a11yProps(1)} />
            </Tabs>
        </div>
    );
}
