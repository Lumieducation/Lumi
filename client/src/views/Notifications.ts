import { withSnackbar } from 'notistack';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { INotification } from '../state/Notifications/NotificationsTypes';

import * as actions from '../state/Notifications/NotificationsActions';
import * as selectors from '../state/Notifications/NotificationsSelectors';

interface IPassedProps {
    enqueueSnackbar: (message: string, options: any) => void;
}

interface IStateProps extends IPassedProps {
    notifications: INotification[];
}

interface IDispatchProps {
    closeSnackbar: typeof actions.closeSnackbar;
    removeSnackbar: typeof actions.removeSnackbar;
}

interface IComponentState {}

interface IProps extends IStateProps, IDispatchProps {}

export class NotificationsContainer extends React.Component<
    IProps,
    IComponentState
> {
    private displayed: string[] = [];

    public componentDidUpdate(): void {
        const { notifications = [] } = this.props;

        notifications.forEach(({ key, message, options = {} }) => {
            // Do nothing if snackbar is already displayed
            if (this.displayed.includes(key)) return;
            // Display snackbar using notistack
            this.props.enqueueSnackbar(message, {
                ...options,
                onClose: (event: any, reason: any, key2: string) => {
                    // if (options.onClose) {
                    //     options.onClose(event, reason, key);
                    // }
                    // // Dispatch action to remove snackbar from redux store
                    this.props.removeSnackbar(key2);
                }
            });
            // Keep track of snackbars that we've displayed
            this.storeDisplayed(key);
        });
    }

    public render(): null {
        return null;
    }

    public shouldComponentUpdate({
        notifications: newSnacks = []
    }: any): boolean {
        if (!newSnacks.length) {
            this.displayed = [];
            return false;
        }

        const { notifications: currentSnacks } = this.props;
        let notExists = false;
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < newSnacks.length; i += 1) {
            const newSnack = newSnacks[i];
            if (newSnack.dismissed) {
                this.props.closeSnackbar(newSnack.key);
                this.props.removeSnackbar(newSnack.key);
            }

            if (notExists) continue;
            notExists =
                notExists ||
                !currentSnacks.filter(({ key }) => newSnack.key === key).length;
        }
        return notExists;
    }

    private storeDisplayed(id: string): void {
        this.displayed = [...this.displayed, id];
    }
}

function mapStateToProps(state: any, ownProps: IPassedProps): IStateProps {
    return {
        enqueueSnackbar: ownProps.enqueueSnackbar,
        notifications: selectors.notifications(state)
    };
}

function mapDispatchToProps(dispatch: any): IDispatchProps {
    return bindActionCreators(
        {
            closeSnackbar: actions.closeSnackbar,
            removeSnackbar: actions.removeSnackbar
        },
        dispatch
    );
}
export default withSnackbar(
    connect(
        mapStateToProps as any,
        mapDispatchToProps as any
    )(NotificationsContainer as any)
);
