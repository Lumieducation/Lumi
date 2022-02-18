import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';

import i18next from 'i18next';

import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';

import LibraryDetails from './LibraryManagementDetails';

import H5PAvatar from '../H5PAvatar';

// The .js references are necessary for requireJs to work in the browser.
// import LibraryDetails from './LibraryDetailsComponent';
import {
    ILibraryViewModel,
    LibraryAdministrationAPI
} from '../../../services/LibraryAdministrationAPI';
import { actions } from '../../../state';
import { NotificationTypes } from '../../../state/Notifications/NotificationsTypes';
/**
 * The components displays a list with the currently installed libraries. It
 * offers basic administration functions like deleting libraries, showing more
 * details of an installed library and uploading new libraries.
 *
 * It uses Bootstrap 4 to layout the component. You can override or replace the
 * render() method to customize looks.
 */
export class LibraryAdmin extends React.Component<
    { notify: typeof actions.notifications.notify },
    {
        isUploading: boolean;
        libraries?: ILibraryViewModel[] | null;
        message: {
            text: string;
            type: 'primary' | 'success' | 'danger';
        } | null;
    }
> {
    protected librariesService: LibraryAdministrationAPI;

    constructor(props: { notify: typeof actions.notifications.notify }) {
        super(props);

        this.state = {
            isUploading: false,
            libraries: null,
            message: null
        };
        this.librariesService = new LibraryAdministrationAPI();
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
            const libraryIndex = libraries?.indexOf(library);
            if (libraryIndex === undefined) {
                throw new Error('Could not find old entry in list');
            }
            this.setState({
                libraries: libraries
                    ?.slice(0, libraryIndex)
                    .concat(libraries?.slice(libraryIndex + 1))
            });
            this.displayMessage(
                i18next.t(
                    `settings.h5p-library-administration.notifications.delete.success`,
                    {
                        title: library.title,
                        version: `${library.majorVersion}.${library.minorVersion}`
                    }
                ),
                'success'
            );
            await this.updateList();
        } catch {
            this.displayMessage(
                i18next.t(
                    'settings.h5p-library-administration.notifications.delete.error',
                    {
                        title: library.title,
                        version: `${library.majorVersion}.${library.minorVersion}`
                    }
                ),
                'error'
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
            const { installed, updated } =
                await this.librariesService.postPackage(files[0]);
            if (installed + updated === 0) {
                this.displayMessage(
                    i18next.t(
                        'settings.h5p-library-administration.notifications.upload.success-no-update'
                    ),
                    'success'
                );
                return;
            }
            this.displayMessage(
                i18next.t(
                    'settings.h5p-library-administration.notifications.upload.success-with-update',
                    { installed, updated }
                ),
                'success'
            );
        } catch {
            this.displayMessage(
                i18next.t(
                    'settings.h5p-library-administration.notifications.upload.error'
                ),
                'error'
            );
            return;
        } finally {
            this.setState({ isUploading: false });
        }
        this.setState({ libraries: null });
        try {
            const libraries = await this.librariesService.getLibraries();
            this.setState({ libraries });
        } catch (error: any) {
            this.props.notify(error.message, 'error');
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
                    i18next.t(
                        'settings.h5p-library-administration.notifications.get.error',
                        {
                            title: library.title,
                            version: `${library.majorVersion}.${library.minorVersion}`
                        }
                    ),
                    'error'
                );
            }
        }
    }

    public async updateList(): Promise<void> {
        try {
            const libraries = await this.librariesService.getLibraries();
            this.setState({ libraries });
        } catch (error: any) {
            this.props.notify(error.message, 'error');
        }
    }

    protected displayMessage(text: string, type: NotificationTypes): void {
        this.props.notify(text, type);
        // this.setState({
        //     message: {
        //         text,
        //         type
        //     }
        // });
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
                                    style={{ display: 'flex', padding: '20px' }}
                                >
                                    <CircularProgress
                                        style={{
                                            margin: 'auto'
                                            // display: 'block'
                                        }}
                                    />
                                </div>
                            ) : (
                                <span className="fa fa-upload m-2" />
                            )}{' '}
                            <div style={{ display: 'flex', padding: '20px' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    component="span"
                                    style={{
                                        margin: 'auto'
                                        // display: 'block'
                                    }}
                                >
                                    {i18next.t(
                                        'settings.h5p-library-administration.upload_and_install'
                                    )}
                                </Button>
                            </div>
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
                    <div style={{ display: 'flex', padding: '20px' }}>
                        <CircularProgress
                            style={{
                                margin: 'auto'
                                // display: 'block'
                            }}
                        />
                    </div>
                ) : (
                    <List
                        subheader={
                            <ListSubheader
                                component="div"
                                style={{
                                    position: 'relative'
                                }}
                            >
                                {i18next.t(
                                    'settings.h5p-library-administration.header'
                                )}
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
                                    <ButtonGroup
                                        color="primary"
                                        aria-label="outlined primary button group"
                                    >
                                        {info.canBeDeleted ? (
                                            <Button
                                                disabled={info.isDeleting}
                                                onClick={() =>
                                                    this.deleteLibrary(info)
                                                }
                                            >
                                                {i18next.t('general.delete')}
                                            </Button>
                                        ) : (
                                            <Tooltip
                                                title={`${i18next.t(
                                                    'settings.h5p-library-administration.can-not-be-deleted',
                                                    {
                                                        count: info.dependentsCount
                                                    }
                                                )}`}
                                                placement="bottom"
                                            >
                                                <div
                                                    style={{
                                                        marginRight: '20px'
                                                    }}
                                                >
                                                    <Button disabled={true}>
                                                        {i18next.t(
                                                            'general.delete'
                                                        )}
                                                    </Button>
                                                </div>
                                            </Tooltip>
                                        )}
                                        <LibraryDetails
                                            details={info.details}
                                            showDetails={() =>
                                                this.showDetails(info)
                                            }
                                        />
                                    </ButtonGroup>
                                    {/* <Button variant="contained">
                                        {i18next.t(
                                            'settings.h5p-library-administration.details'
                                        )}
                                    </Button> */}
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}
            </div>
        );
    }
}

function mapStateToProps(state: any, ownProps: any): any {
    return {};
}

function mapDispatchToProps(dispatch: any): any {
    return bindActionCreators(
        {
            notify: actions.notifications.notify
        },
        dispatch
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(LibraryAdmin);
