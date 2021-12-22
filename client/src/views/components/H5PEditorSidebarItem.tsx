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
import { Fragment, useEffect, useState } from 'react';

import { getLibraryOverview } from '../../services/H5PApi';
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
    // We store the user-readable main library name in an internal state, as we
    // need to fetch it async from the server through the Ajax API
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
        <Fragment>
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
        </Fragment>
    );
}
