import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from '../actions';

import { H5P_UPDATE_REQUEST, H5P_UPDATE_SUCCESS } from '../types';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe.skip('updateH5P', () => {
    it('dispatches the correct actions', async done => {
        const h5p = {
            id: undefined,
            library: 'H5P.Test 1.0',
            metadata: { data: 'abc' },
            parameters: { arbitrary: 'data' }
        };

        const updatedh5p = {
            id: 12345,
            library: 'H5P.Example 1.2',
            metadata: {},
            parameters: {}
        };

        const expectedActions: any[] = [
            {
                payload: {
                    ...h5p
                },
                type: H5P_UPDATE_REQUEST
            },
            {
                payload: {
                    ...updatedh5p
                },
                type: H5P_UPDATE_SUCCESS
            }
        ];
        const store = mockStore();
        await store.dispatch(
            actions.updateH5P(h5p.parameters, h5p.metadata, h5p.library, h5p.id)
        );
        expect(store.getActions()).toEqual(expectedActions);
        done();
    });
});
