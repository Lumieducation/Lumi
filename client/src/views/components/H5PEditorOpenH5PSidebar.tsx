import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import { useTranslation } from 'react-i18next';
import Toolbar from '@material-ui/core/Toolbar';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFileOutlined';
import AddIcon from '@material-ui/icons/Add';

import { ITab } from '../../state/H5PEditor/H5PEditorTypes';
import H5PEditorSidebarItem from './H5PEditorSidebarItem';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex'
        },
        drawer: {
            width: drawerWidth,
            flexShrink: 0
        },
        drawerPaper: {
            width: drawerWidth
        },
        drawerContainer: {
            overflow: 'auto'
        },
        content: {
            flexGrow: 1,
            padding: theme.spacing(3)
        }
    })
);

export default function H5PEditorLeftDrawerView(props: {
    tabs: ITab[];
    activeTabIndex: number;
    create: () => void;
    openFiles: () => void;
    selectTab: (index: number) => void;
    closeTab: (index: number, id: string) => void;
}) {
    const { activeTabIndex, closeTab, create, openFiles, selectTab, tabs } =
        props;
    const classes = useStyles();

    const { t } = useTranslation();

    return (
        <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{
                paper: classes.drawerPaper
            }}
        >
            <Toolbar />
            <div className={classes.drawerContainer}>
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
                                <H5PEditorSidebarItem
                                    tab={tab}
                                    onSelect={() => selectTab(index)}
                                    onClose={() => closeTab(index, tab.id)}
                                />
                                {index !== tabs.length - 1 && (
                                    <Divider component="li" />
                                )}
                            </div>
                        ))}
                        {tabs.length === 0 ? (
                            <ListItem>
                                <ListItemText
                                    primary={t('editor.sidebar.noOpenFiles')}
                                />
                            </ListItem>
                        ) : null}
                        <Divider />
                        <ListItem onClick={openFiles} button={true}>
                            <ListItemAvatar>
                                <InsertDriveFileOutlinedIcon />
                            </ListItemAvatar>
                            <ListItemText primary={t('editor.sidebar.open')} />
                        </ListItem>
                        <ListItem onClick={create} button={true}>
                            <ListItemAvatar>
                                <AddIcon />
                            </ListItemAvatar>
                            <ListItemText
                                primary={t('editor.sidebar.create')}
                            />
                        </ListItem>
                    </List>
                </div>
            </div>
        </Drawer>
    );
}
