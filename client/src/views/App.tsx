import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Logger from '../helpers/Logger';

import CssBaseline from '@material-ui/core/CssBaseline';

import AppBar from './components/AppBar';

import Notifications from './Notifications';

import RunPage from './Run';

import H5PEditor from './H5PEditor';
import Analytics from './Analytics';
import Launchpad from './Launchpad';

import SetupDialog from './components/SetupDialog';
import Backdrop from './components/Backdrop';
import Websocket from './Websocket';
import RunSetupDialogContainer from './container/RunSetupDialogContainer';
import RunUploadDialogContainer from './container/RunUploadDialogContainer';

import ErrorDialog from './components/ErrorDialog';
import { actions } from '../state';

const log = new Logger('container:app');

export default function AppContainer() {
    log.info(`rendering`);
    const dispatch = useDispatch();
    const { i18n } = useTranslation();

    useEffect(() => {
        dispatch(actions.settings.getSettings()).then(
            async (settings: { language: string; autoUpdates: boolean }) => {
                if (settings?.language) {
                    await i18n.loadLanguages(settings.language);
                    i18n.changeLanguage(settings.language);
                }
                if (settings?.autoUpdates) {
                    dispatch(actions.updates.getUpdates());
                }
            }
        );

        dispatch(actions.system.getSystem());
    }, [dispatch, i18n]);

    return (
        <div id="app">
            <CssBaseline />
            <Router>
                <Websocket />
                <AppBar />
                <Routes>
                    <Route path="/h5peditor" element={<H5PEditor />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/run" element={<RunPage />} />
                    <Route path="/" element={<Launchpad />} />
                </Routes>
                <SetupDialog />
                <RunUploadDialogContainer />
                <RunSetupDialogContainer />
                <ErrorDialog />
            </Router>
            <Notifications />

            <Backdrop />
        </div>
    );
}
