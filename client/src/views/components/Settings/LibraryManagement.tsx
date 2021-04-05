import React from 'react';
import { useTranslation } from 'react-i18next';

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import Button from '@material-ui/core/Button';

import H5PAvatar from '../H5PAvatar';
// import EmailIcon from '@material-ui/icons/Email';

// const useStyles = makeStyles((theme: Theme) =>
//     createStyles({
//         root: {
//             width: '100%',
//             backgroundColor: theme.palette.background.paper
//         }
//     })
// );

// export default function SettingsLibraryManagement() {
//     const classes = useStyles();

//     const { t } = useTranslation();

//     return (
//         <List
//             subheader={
//                 <ListSubheader>{t('settings.libraries.label')}</ListSubheader>
//             }
//             className={classes.root}
//         >
//             <ListItem>
//                 <ListItemIcon>
//                     <EmailIcon />
//                 </ListItemIcon>
//                 <ListItemText
//                     id="switch-list-label-privacy-policy"
//                     primary={t('libraries will come here')}
//                     secondary={'...' /*settings.email */}
//                 />
//                 <ListItemSecondaryAction>
//                     <Button variant="contained">{t('action')}</Button>
//                 </ListItemSecondaryAction>
//             </ListItem>
//         </List>
//     );
// }

// We reference the build directory (which contains a .d.ts file) to avoid
// including the whole server part of the library in the build of the client.
import type { ILibraryAdministrationOverviewItem } from '@lumieducation/h5p-server';

// The .js references are necessary for requireJs to work in the browser.
// import LibraryDetails from './LibraryDetailsComponent';
import {
    ILibraryViewModel,
    LibraryAdministrationService
} from '../../../services/LibraryAdministrationService';

/**
 * The components displays a list with the currently installed libraries. It
 * offers basic administration functions like deleting libraries, showing more
 * details of an installed library and uploading new libraries.
 *
 * It uses Bootstrap 4 to layout the component. You can override or replace the
 * render() method to customize looks.
 */
export default class LibraryAdmin extends React.Component<
    { endpointUrl: string },
    {
        isUploading: boolean;
        libraries?: ILibraryViewModel[] | null;
        message: {
            text: string;
            type: 'primary' | 'success' | 'danger';
        } | null;
    }
> {
    protected librariesService: LibraryAdministrationService;

    /**
     * @param endpointUrl the URL of the REST library administration endpoint.
     */
    constructor(props: { endpointUrl: string }) {
        super(props);

        this.state = {
            isUploading: false,
            libraries: null,
            message: null
        };
        this.librariesService = new LibraryAdministrationService(
            props.endpointUrl
        );
    }

    public async componentDidMount(): Promise<void> {
        return this.updateList();
    }

    protected closeDetails(library: ILibraryViewModel): void {
        this.updateLibraryState(library, { isShowingDetails: false });
    }

    protected async deleteLibrary(library: ILibraryViewModel): Promise<void> {
        const newState = this.updateLibraryState(library, {
            isDeleting: true
        });
        const { libraries } = this.state;

        try {
            await this.librariesService.deleteLibrary(library);
            const libraryIndex = libraries?.indexOf(newState);
            if (libraryIndex === undefined) {
                throw new Error('Could not find old entry in list');
            }
            this.setState({
                libraries: libraries
                    ?.slice(0, libraryIndex)
                    .concat(libraries?.slice(libraryIndex + 1))
            });
            this.displayMessage(
                `Successfully deleted library ${library.title} (${library.majorVersion}.${library.minorVersion}).`
            );
            await this.updateList();
        } catch {
            this.displayMessage(
                `Error deleting library ${library.title} (${library.majorVersion}.${library.minorVersion}).`,
                'danger'
            );
            this.updateLibraryState(newState, { isDeleting: false });
            await this.updateList();
        }
    }

    protected async fileSelected(files: FileList | null): Promise<void> {
        if (!files || !files[0]) {
            return;
        }
        try {
            this.setState({ isUploading: true });
            const {
                installed,
                updated
            } = await this.librariesService.postPackage(files[0]);
            if (installed + updated === 0) {
                this.displayMessage(
                    'Upload successful, but no libraries were installed or updated. The content type is probably already installed on the system.'
                );
                return;
            }
            this.displayMessage(
                `Successfully installed ${installed} and updated ${updated} libraries.`,
                'success'
            );
        } catch {
            this.displayMessage(`Error while uploading package.`, 'danger');
            return;
        } finally {
            this.setState({ isUploading: false });
        }
        this.setState({ libraries: null });
        const libraries = await this.librariesService.getLibraries();
        this.setState({ libraries });
    }

    protected async restrict(
        library: ILibraryAdministrationOverviewItem
    ): Promise<void> {
        try {
            const newLibrary = await this.librariesService.patchLibrary(
                library,
                {
                    restricted: !library.restricted
                }
            );
            this.updateLibraryState(library, newLibrary);
            this.displayMessage(
                `Successfully set restricted property of library ${library.title} (${library.majorVersion}.${library.minorVersion}) to ${newLibrary.restricted}.`,
                'success'
            );
        } catch {
            this.displayMessage(
                `Error setting restricted proeprty of library ${library.title} (${library.majorVersion}.${library.minorVersion}).`,
                'danger'
            );
        }
    }

    protected async showDetails(library: ILibraryViewModel): Promise<void> {
        const newState = this.updateLibraryState(library, {
            isShowingDetails: true
        });

        if (!library.details) {
            try {
                const details = await this.librariesService.getLibrary(library);
                this.updateLibraryState(newState, {
                    details
                });
            } catch {
                this.displayMessage(
                    `Error getting detailed information about library ${library.title} (${library.majorVersion}.${library.minorVersion}).`,
                    'danger'
                );
            }
        }
    }

    public async updateList(): Promise<void> {
        const libraries = await this.librariesService.getLibraries();
        this.setState({ libraries });
    }

    protected displayMessage(
        text: string,
        type: 'primary' | 'success' | 'danger' = 'primary'
    ): void {
        this.setState({
            message: {
                text,
                type
            }
        });
    }

    protected updateLibraryState(
        library: ILibraryViewModel,
        changes: Partial<ILibraryViewModel>
    ): ILibraryViewModel {
        const { libraries } = this.state;

        if (!libraries) {
            return {
                ...library,
                ...changes
            };
        }
        const libraryIndex = libraries.indexOf(library);
        const newState = {
            ...library,
            ...changes
        };
        this.setState({
            libraries: [
                ...libraries.slice(0, libraryIndex),
                newState,
                ...libraries.slice(libraryIndex + 1)
            ]
        });
        return newState;
    }

    public render(): React.ReactNode {
        return (
            <div>
                <form>
                    <div className="form-group">
                        <label
                            className={`btn btn-primary ${
                                this.state.isUploading ? 'disabled' : ''
                            }`}
                        >
                            {this.state.isUploading ? (
                                <div
                                    className="spinner-border spinner-border-sm m-2 align-middle"
                                    role="status"
                                />
                            ) : (
                                <span className="fa fa-upload m-2" />
                            )}{' '}
                            Upload libraries
                            <input
                                disabled={this.state.isUploading}
                                type="file"
                                id="file2"
                                hidden
                                onChange={(e) =>
                                    this.fileSelected(e.target.files)
                                }
                            />
                        </label>
                    </div>
                </form>
                {this.state.message ? (
                    <div className={`alert alert-${this.state.message.type}`}>
                        {this.state.message.text}
                    </div>
                ) : null}
                {this.state.libraries === null ? (
                    <div>
                        <div
                            className="spinner-grow spinner-grow-sm text-primary align-middle mr-2"
                            role="status"
                        >
                            <span className="sr-only" />
                        </div>
                        <span className="align-middle">
                            Loading installed libraries from REST endpoint ...
                        </span>
                    </div>
                ) : (
                    <List
                        subheader={
                            <ListSubheader>
                                {'settings.libraries.label'}
                            </ListSubheader>
                        }
                        // className={classes.root}
                    >
                        {this.state.libraries?.map((info) => (
                            <ListItem
                                key={`${info.machineName}-${info.majorVersion}.${info.minorVersion}`}
                            >
                                <ListItemIcon>
                                    <H5PAvatar mainLibrary={info.machineName} />
                                </ListItemIcon>
                                <ListItemText
                                    id="switch-list-label-privacy-policy"
                                    primary={info.title}
                                    secondary={`${info.majorVersion}.${info.minorVersion}.${info.patchVersion}`}
                                />
                                <ListItemSecondaryAction>
                                    <Button variant="contained">
                                        {'Details'}
                                    </Button>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}
            </div>
        );
    }
}
