import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import { makeStyles, Theme } from '@material-ui/core/styles';

interface IPassedProps {}

interface IStateProps extends IPassedProps {
    children: React.ReactNode;
}

interface IDispatchProps {}

interface IProps extends IStateProps, IDispatchProps {}

// tslint:disable-next-line: variable-name
const ContentPaper: React.FunctionComponent<IProps> = (props: IProps) => {
    const classes = useStyles();
    return <Paper className={classes.paper}>{props.children}</Paper>;
};

export default ContentPaper;

const useStyles = makeStyles((theme: Theme) => {
    return {
        paper: {
            margin: '20px',
            padding: '20px'
        }
    };
});
