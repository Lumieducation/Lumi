import React from 'react';
import { animated, useSpring } from 'react-spring';

import Collapse from '@material-ui/core/Collapse';
import {
    createStyles,
    fade,
    makeStyles,
    Theme,
    withStyles
} from '@material-ui/core/styles';
import { TransitionProps } from '@material-ui/core/transitions';

import TreeItem, { TreeItemProps } from '@material-ui/lab/TreeItem';
import TreeView from '@material-ui/lab/TreeView';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FileIcon from '@material-ui/icons/InsertDriveFile';
import OpenFileIcon from '@material-ui/icons/InsertDriveFileOutlined';

import * as FS from '../../fs';

function buildTree(
    entry: FS.types.ITreeEntry,
    onClick: (item: FS.types.ITreeEntry) => void,
    currentDirectory: string,
    activePath: string
): JSX.Element {
    if (entry.type === 'file') {
        return (
            <StyledTreeItem
                key={entry.path}
                nodeId={`${entry.path}`}
                label={entry.name}
                onClick={() => onClick(entry)}
                icon={
                    activePath === entry.path ? <OpenFileIcon /> : <FileIcon />
                }
            >
                {entry.children
                    ? entry.children.map((child: any) =>
                          buildTree(
                              child,
                              onClick,
                              currentDirectory,
                              activePath
                          )
                      )
                    : null}
            </StyledTreeItem>
        );
    }

    return (
        <StyledTreeItem
            key={entry.path}
            nodeId={`${entry.path}`}
            label={entry.name}
            onClick={() => onClick(entry)}
            style={{
                backgroundColor:
                    entry.path === currentDirectory ? 'lightgrey' : 'white'
            }}
        >
            {entry.children
                ? entry.children.map((child: any) =>
                      buildTree(child, onClick, currentDirectory, activePath)
                  )
                : null}
        </StyledTreeItem>
    );
}

export default function FileTree(props: {
    activePath: string;
    currentDirectory: string;
    onClick: (item: FS.types.ITreeEntry) => void;
    tree: FS.types.ITreeEntry;
}): JSX.Element {
    const classes = useStyles(props);

    const { currentDirectory, tree, onClick } = props;

    return (
        <TreeView
            className={classes.root}
            defaultExpanded={['1']}
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            defaultEndIcon={<ChevronRightIcon />}
        >
            {buildTree(tree, onClick, currentDirectory, props.activePath)}
        </TreeView>
    );
}

// tslint:disable-next-line: variable-name
const StyledTreeItem = withStyles((theme: Theme) =>
    createStyles({
        group: {
            borderLeft: `1px dashed ${fade(theme.palette.text.primary, 0.4)}`,
            marginLeft: 12,
            paddingLeft: 12
        },
        iconContainer: {
            '& .close': {
                opacity: 0.3
            }
        }
    })
)((props: TreeItemProps) => (
    <TreeItem
        id={props.nodeId}
        {...props}
        TransitionComponent={TransitionComponent}
    />
));

function TransitionComponent(props: TransitionProps): JSX.Element {
    const style = useSpring({
        from: { opacity: 0, transform: 'translate3d(20px,0,0)' },
        to: {
            opacity: props.in ? 1 : 0,
            transform: `translate3d(${props.in ? 0 : 20}px,0,0)`
        }
    });

    return (
        <animated.div style={style}>
            <Collapse {...props} />
        </animated.div>
    );
}

const useStyles = makeStyles(
    createStyles({
        root: {
            flexGrow: 1,
            height: 264,
            maxWidth: 400
        }
    })
);
