import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Logger from 'client/helpers/Logger';

import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';

import H5PAvatar from 'components/H5PAvatar';

import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';

import { ITab } from 'state/tabs/types';

import { actions, IState, selectors } from 'client/state';

import { track } from 'state/track/actions';

const log = new Logger('container:Tabs');

interface IPassedProps {}

interface IStateProps extends IPassedProps {
    activeTabIndex: number;
    tabs: ITab[];
}

interface IDispatchProps {
    closeTab: typeof actions.core.closeTab;
    createH5P: typeof actions.core.clickOnCreateH5P;
    openFiles: typeof actions.core.openH5P;
    selectTab: typeof actions.tabs.selectTab;
}

interface IComponentState {}

interface IProps extends IStateProps, IDispatchProps {}

export class TabsContainer extends React.Component<IProps, IComponentState> {
    constructor(props: IProps) {
        super(props);

        this.state = {};

        this.create = this.create.bind(this);
        this.selectTab = this.selectTab.bind(this);
        this.openFiles = this.openFiles.bind(this);
    }

    public openFiles(): void {
        this.props.openFiles();
    }

    public render(): JSX.Element {
        const { activeTabIndex, tabs } = this.props;

        log.info(`rendering ${tabs.length} tabs with index ${activeTabIndex} `);
        return (
            <div id="editor-h5p-list">
                <List>
                    {tabs.map((tab, index) => (
                        <div
                            key={tab.id}
                            style={{
                                backgroundColor:
                                    activeTabIndex === index
                                        ? '#EFEFEF'
                                        : '#FFFFFF'
                            }}
                        >
                            <Tooltip title={tab.path || ''} enterDelay={1000}>
                                <ListItem
                                    onClick={() => this.selectTab(index)}
                                    button={true}
                                >
                                    <ListItemAvatar>
                                        <H5PAvatar
                                            mainLibrary={tab.mainLibrary}
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={tab.name}
                                        secondary={tab.mainLibrary}
                                        style={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                        primaryTypographyProps={{
                                            noWrap: true
                                        }}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            onClick={() =>
                                                this.closeTab(index, tab.id)
                                            }
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </Tooltip>
                            {tab.loadingIndicator ? <LinearProgress /> : null}
                            {index !== tabs.length - 1 ? (
                                <Divider component="li" />
                            ) : null}
                        </div>
                    ))}
                    {tabs.length === 0 ? (
                        <ListItem>
                            <ListItemText primary={'No opened files'} />
                        </ListItem>
                    ) : null}
                    <Divider />
                    <ListItem onClick={this.openFiles} button={true}>
                        <ListItemAvatar>
                            <InsertDriveFileOutlinedIcon />
                        </ListItemAvatar>
                        <ListItemText primary={'Open H5P File'} />
                    </ListItem>
                    <ListItem onClick={this.create} button={true}>
                        <ListItemAvatar>
                            <AddIcon />
                        </ListItemAvatar>
                        <ListItemText primary={'New H5P file'} />
                    </ListItem>
                </List>
            </div>
        );
    }

    private closeTab(index: number, id: string): void {
        log.info(`click on close for tab ${index}`);
        this.props.closeTab(id);
    }

    private create(): void {
        track('tab', 'click', 'create_h5p');
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
            openFiles: actions.core.openH5P,
            selectTab: actions.tabs.selectTab
        },
        dispatch
    );
}

export default connect<IStateProps, IDispatchProps, IPassedProps, IState>(
    mapStateToProps,
    mapDispatchToProps
)(TabsContainer);
