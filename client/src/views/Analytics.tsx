import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AnalyticsStartPage from './components/AnalyticsStartPage';
import AnalyticsToolbar from './components/AnalyticsToolbar';

import LumixAPIViewer from '@lumieducation/xapi-viewer';

import { actions, IState } from '../state';

export default function Analytics() {
    const dispatch = useDispatch();
    const users = useSelector((state: IState) => state.analytics.users);
    const interactions = useSelector(
        (state: IState) => state.analytics.interactions
    );
    const [searchText, setSearchText] = useState('');

    return (
        <div style={{ marginTop: '64px' }}>
            {users.length === 0 ? (
                <AnalyticsStartPage
                    primaryButtonClick={() =>
                        dispatch(actions.analytics.importAnalytics())
                    }
                />
            ) : null}

            {users.length > 0 ? (
                <div>
                    <AnalyticsToolbar
                        openFolder={() =>
                            dispatch(actions.analytics.importAnalytics())
                        }
                        search={(text: string) => setSearchText(text)}
                    />

                    <LumixAPIViewer
                        interactions={interactions}
                        users={users.filter(
                            (user) =>
                                user.name
                                    .toLocaleLowerCase()
                                    .indexOf(searchText.toLocaleLowerCase()) >
                                -1
                        )}
                    />
                </div>
            ) : null}
        </div>
    );
}
