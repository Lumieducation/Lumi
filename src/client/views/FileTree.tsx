import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Logger from '../helpers/Logger';

import { ITab } from 'lib/tabs/types';

import { actions, IState, selectors } from '../state';

import * as FSComponents from 'lib/components/fs';

import * as FS from 'lib/fs';

import OpenFolder from 'lib/components/OpenFolder';

import { track } from 'lib/track/actions';

const log = new Logger('container:FileTree');

interface IPassedProps {}

interface IStateProps extends IPassedProps {
    activeTab: ITab;
    currentDirectory: string;
    fileTree: FS.types.ITreeEntry;
    root: string | undefined;
}

interface IDispatchProps {
    getFileTree: typeof actions.fileTree.getFileTree;
    openH5P: typeof actions.core.clickOnFileInFiletree;
    setCurrentDirectory: typeof actions.fileTree.updateCurrentDirectory;
}

interface IComponentState {}

interface IProps extends IStateProps, IDispatchProps {}

export class FileTreeContainer extends React.Component<
    IProps,
    IComponentState
> {
    constructor(props: IProps) {
        super(props);

        this.state = {};

        this.openFolder = this.openFolder.bind(this);
        this.openH5P = this.openH5P.bind(this);
    }

    public render(): JSX.Element {
        const { activeTab, currentDirectory, fileTree, root } = this.props;
        log.info(`rendering`);
        return root ? (
            <FSComponents.Filetree
                activePath={activeTab.path || ''}
                currentDirectory={currentDirectory}
                tree={fileTree}
                onClick={this.openH5P}
            />
        ) : (
            <OpenFolder onClick={this.openFolder} />
        );
    }

    private openFolder(): void {
        log.info(`clicking on open folder`);
        track('file_tree', 'click', 'open_folder');
        this.props.getFileTree();
    }

    private openH5P(item: FS.types.ITreeEntry): void {
        log.info(
            `clicking on fileTree entry ${item.name} and path ${item.path}`
        );
        if (item.type === 'file') {
            this.props.openH5P(item.name, item.path);
        }

        this.props.setCurrentDirectory(item.path, item.type);
    }
}

function mapStateToProps(state: IState, ownProps: IPassedProps): IStateProps {
    return {
        activeTab: selectors.tabs.activeTab(state),
        currentDirectory: selectors.fileTree.currentDirectory(state),
        fileTree: selectors.fileTree.fileTree(state),
        root: selectors.fileTree.root(state)
    };
}

function mapDispatchToProps(dispatch: any): IDispatchProps {
    return bindActionCreators(
        {
            getFileTree: actions.fileTree.getFileTree,
            openH5P: actions.core.clickOnFileInFiletree,
            setCurrentDirectory: actions.fileTree.updateCurrentDirectory
        },
        dispatch
    );
}

export default connect<IStateProps, IDispatchProps, IPassedProps, IState>(
    mapStateToProps,
    mapDispatchToProps
)(FileTreeContainer);
