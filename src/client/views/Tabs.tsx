import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Logger from '../helpers/Logger';

import AppBar from '@material-ui/core/AppBar';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

import AddIcon from '@material-ui/icons/Add';

import TabButton from 'lib/components/TabButton';

import { ITab } from 'lib/tabs/types';

import { actions, IState, selectors } from '../state';

const log = new Logger('container:Tabs');

interface IPassedProps {}

interface IStateProps extends IPassedProps {
    activeTabIndex: number;
    tabs: ITab[];
}

interface IDispatchProps {
    closeTab: typeof actions.core.closeTab;
    createH5P: typeof actions.core.clickOnCreateH5P;
    selectTab: typeof actions.tabs.selectTab;
}

interface IComponentState {}

interface IProps extends IStateProps, IDispatchProps {}

function a11yProps(
    index: any
): {
    'aria-controls': string;
    id: string;
} {
    return {
        'aria-controls': `scrollable-auto-tabpanel-${index}`,
        id: `scrollable-auto-tab-${index}`
    };
}

export class TabsContainer extends React.Component<IProps, IComponentState> {
    constructor(props: IProps) {
        super(props);

        this.state = {};

        this.create = this.create.bind(this);
        this.selectTab = this.selectTab.bind(this);
    }

    public render(): JSX.Element {
        const { activeTabIndex, tabs } = this.props;

        log.info(`rendering ${tabs.length} tabs with index ${activeTabIndex} `);
        return (
            <div id="editor-tabs">
                <AppBar position="static" color="default">
                    <Tabs
                        value={activeTabIndex}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="scrollable auto tabs example"
                    >
                        {tabs.map((tab, index) => (
                            <TabButton
                                key={tab.id}
                                label={tab.name}
                                mainLibrary={tab.mainLibrary}
                                {...a11yProps(index)}
                                close={() => this.closeTab(index, tab.id)}
                                select={() => this.selectTab(index)}
                            />
                        ))}
                        <Tab
                            onClick={this.create}
                            label={'Create new H5P'}
                            icon={<AddIcon />}
                        />
                    </Tabs>
                </AppBar>
            </div>
        );
    }

    private closeTab(index: number, id: string): void {
        log.info(`click on close for tab ${index}`);
        this.props.closeTab(id);
    }

    private create(): void {
        this.props.createH5P();
    }

    private selectTab(value: number): void {
        log.info(`clicking on tab ${value}`);
        this.props.selectTab(value);
    }
}

function mapStateToProps(state: IState, ownProps: IPassedProps): IStateProps {
    return {
        activeTabIndex: selectors.tabs.activeTabIndex(state),
        tabs: selectors.tabs.all(state)
    };
}

function mapDispatchToProps(dispatch: any): IDispatchProps {
    return bindActionCreators(
        {
            closeTab: actions.core.closeTab,
            createH5P: actions.core.clickOnCreateH5P,
            selectTab: actions.tabs.selectTab
        },
        dispatch
    );
}

export default connect<IStateProps, IDispatchProps, IPassedProps, IState>(
    mapStateToProps,
    mapDispatchToProps
)(TabsContainer);
