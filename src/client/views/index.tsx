import React from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import Logger from '../helpers/Logger';

import CssBaseline from '@material-ui/core/CssBaseline';
import { createStyles, Theme, withStyles } from '@material-ui/core/styles';

import ErrorBoundary from 'components/ErrorBoundary';

import Notifications from './Notifications';

import Websocket from '../boot/Websocket';

import Editor from './Editor';

import { IState } from '../state';

const log = new Logger('container:app');

interface IPassedProps {
    classes: any;
}

interface IStateProps extends IPassedProps {}

interface IDispatchProps {}

interface IComponentState {}

interface IProps extends IStateProps, IDispatchProps {}

export class AppContainer extends React.Component<IProps, IComponentState> {
    constructor(props: IProps) {
        super(props);

        this.state = {};
    }

    public render(): JSX.Element {
        log.info(`rendering`);
        return (
            <div id="app">
                <CssBaseline />
                <ErrorBoundary>
                    <Notifications />
                </ErrorBoundary>
                <ErrorBoundary>
                    <Websocket />
                </ErrorBoundary>
                <Switch>
                    <Route exact={true} path="/editor" component={Editor} />
                    <Route path="/" component={Editor} />
                </Switch>
            </div>
        );
    }
}

const styles = (theme: Theme) => createStyles({});

function mapStateToProps(state: IState, ownProps: IPassedProps): IStateProps {
    return {
        classes: ownProps.classes
    };
}

function mapDispatchToProps(dispatch: any): IDispatchProps {
    return bindActionCreators({}, dispatch);
}

export default withStyles(styles)(
    connect<IStateProps, IDispatchProps, IPassedProps, IState>(
        mapStateToProps,
        mapDispatchToProps
    )(AppContainer)
);
