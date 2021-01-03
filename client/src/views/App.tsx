import React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import Logger from '../helpers/Logger';

import CssBaseline from '@material-ui/core/CssBaseline';
import { createStyles, Theme, withStyles } from '@material-ui/core/styles';

import AppBar from './components/AppBar';

import Notifications from './Notifications';

import H5PEditor from './H5PEditor';
import Analytics from './Analytics';
// import Launchpad from './Launchpad';

import Websocket from './Websocket';

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
                <Websocket />
                <Router>
                    <AppBar />
                    <Switch>
                        <Route
                            exact={true}
                            path="/h5peditor"
                            component={H5PEditor}
                        />
                        <Route
                            exact={true}
                            path="/analytics"
                            component={Analytics}
                        />
                        <Route path="/" component={H5PEditor} />
                    </Switch>
                </Router>
                <Notifications />
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
