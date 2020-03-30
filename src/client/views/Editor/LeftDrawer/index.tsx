import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Logger from 'client/helpers/Logger';

import LeftDrawer from 'components/LeftDrawer';

import OpenedH5PList from './OpenedH5PList';

import { actions, IState, selectors } from 'client/state';

const log = new Logger('container:app');

interface IPassedProps {}

interface IStateProps extends IPassedProps {
    leftDrawerOpen: boolean;
    noActiveTabs: boolean;
}

interface IDispatchProps {
    closeLeftDrawer: typeof actions.ui.closeLeftDrawer;
    openLeftDrawer: typeof actions.ui.openLeftDrawer;
}

interface IComponentState {}

interface IProps extends IStateProps, IDispatchProps {}

export class LeftDrawerContainer extends React.Component<
    IProps,
    IComponentState
> {
    constructor(props: IProps) {
        super(props);

        this.state = {};

        this.closeLeftDrawer = this.closeLeftDrawer.bind(this);
        this.openLeftDrawer = this.openLeftDrawer.bind(this);
    }

    public closeLeftDrawer(): void {
        log.info(`closing left-drawer`);
        this.props.closeLeftDrawer();
    }

    public openLeftDrawer(): void {
        log.info(`opening left-drawer`);
        this.props.openLeftDrawer();
    }

    public render(): JSX.Element {
        log.info(`rendering`);

        const { closeLeftDrawer, leftDrawerOpen } = this.props;
        return (
            <div id="editor-leftdrawer">
                <LeftDrawer
                    leftDrawerOpen={leftDrawerOpen}
                    closeLeftDrawer={closeLeftDrawer}
                >
                    <OpenedH5PList />
                </LeftDrawer>
            </div>
        );
    }
}

function mapStateToProps(state: IState, ownProps: IPassedProps): IStateProps {
    return {
        leftDrawerOpen: selectors.ui.leftDrawerOpen(state),
        noActiveTabs: selectors.tabs.noActiveTabs(state)
    };
}

function mapDispatchToProps(dispatch: any): IDispatchProps {
    return bindActionCreators(
        {
            closeLeftDrawer: actions.ui.closeLeftDrawer,
            openLeftDrawer: actions.ui.openLeftDrawer
        },
        dispatch
    );
}

export default connect<IStateProps, IDispatchProps, IPassedProps, IState>(
    mapStateToProps,
    mapDispatchToProps
)(LeftDrawerContainer);
