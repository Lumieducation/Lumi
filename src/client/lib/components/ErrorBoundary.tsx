import React from 'react';

import Logger from '../../helpers/Logger';

const log = new Logger('components:ErrorBoundary');

interface IPassedProps {}

interface IStateProps extends IPassedProps {}

interface IDispatchProps {}

interface IComponentState {
    hasError: boolean;
}

interface IProps extends IStateProps, IDispatchProps {}

export default class ErrorBoundary extends React.Component<
    IProps,
    IComponentState
> {
    constructor(props: IProps) {
        super(props);
        this.state = { hasError: false };
    }

    private static getDerivedStateFromError(): { hasError: boolean } {
        return { hasError: true };
    }

    public componentDidCatch(error: any, errorInfo: any): void {
        log.error(error);
        log.error(errorInfo);
    }

    public render(): React.ReactNode {
        if (this.state.hasError) {
            return <h1>Something went wrong.</h1>;
        }

        return this.props.children;
    }
}
