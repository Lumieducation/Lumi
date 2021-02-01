import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Logger from '../helpers/Logger';

import CssBaseline from '@material-ui/core/CssBaseline';

import AppBar from './components/AppBar';

import Notifications from './Notifications';

import H5PEditor from './H5PEditor';
import Analytics from './Analytics';
import Launchpad from './Launchpad';

import Websocket from './Websocket';

const log = new Logger('container:app');

export default function AppContaine() {
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
                    <Route path="/" component={Launchpad} />
                </Switch>
            </Router>
            <Notifications />
        </div>
    );
}
