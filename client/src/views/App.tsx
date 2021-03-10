import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Logger from '../helpers/Logger';

import CssBaseline from '@material-ui/core/CssBaseline';

import AppBar from './components/AppBar';

import Notifications from './Notifications';

import H5PEditor from './H5PEditor';
import Analytics from './Analytics';
import Launchpad from './Launchpad';

import SetupDialog from './components/SetupDialog';
import LoadingScreen from './components/LoadingScreen';

import Websocket from './Websocket';

import { actions } from '../state';

const log = new Logger('container:app');

export default function AppContainer() {
    log.info(`rendering`);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(actions.settings.getSettings());
    });

    return (
        <div id="app">
            <Suspense fallback={<LoadingScreen />}>
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
                        <Route path="/" component={Launchpad} />
                    </Switch>
                </Router>
                <SetupDialog />
                <Notifications />
            </Suspense>
        </div>
    );
}
