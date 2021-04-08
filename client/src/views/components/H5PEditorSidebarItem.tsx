import {
    IconButton,
    LinearProgress,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    Tooltip
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import React, { useEffect, useState } from 'react';
import { getLibraryOverview } from '../../state/H5PEditor/H5PApi';

import { ITab } from '../../state/H5PEditor/H5PEditorTypes';
import H5PAvatar from './H5PAvatar';

export default function H5PEditorSidebarItem({
    tab,
    onSelect,
    onClose
}: {
    tab: ITab;
    onSelect: () => void;
    onClose: () => void;
}) {
    const [mainLibrayName, setMainLibraryName] = useState<string>('');
    useEffect(() => {
        if (tab?.mainLibrary && tab?.mainLibrary !== '') {
            getLibraryOverview(tab.mainLibrary)
                .then((response) => {
                    if (response.ok) {
                        setMainLibraryName(response.body[0].title);
                    } else {
                        console.error(
                            `Error while getting library overview for ${tab.mainLibrary}: ${response.text}`
                        );
                    }
                })
                .catch((error) => {
                    console.error(
                        `Error while getting library overview for ${tab.mainLibrary}: ${error.message}`
                    );
                });
        }
    }, [tab]);

    return (
        <React.Fragment>
            <Tooltip title={tab.path || ''} enterDelay={1000}>
                <ListItem onClick={onSelect} button={true}>
                    <ListItemAvatar>
                        <H5PAvatar
                            mainLibrary={tab.mainLibrary.split(' ')[0]}
                        />
                    </ListItemAvatar>
                    <ListItemText
                        primary={tab.name}
                        secondary={mainLibrayName}
                        secondaryTypographyProps={{
                            noWrap: true
                        }}
                        style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                        primaryTypographyProps={{
                            noWrap: true
                        }}
                    />
                    <ListItemSecondaryAction>
                        <IconButton edge="end" onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
            </Tooltip>
            {tab.loadingIndicator && <LinearProgress />}
        </React.Fragment>
    );
}
