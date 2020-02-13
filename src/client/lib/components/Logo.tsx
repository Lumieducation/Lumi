// modules
import * as React from 'react';

import { withStyles } from '@material-ui/core/styles';

// actions

interface IPassedProps {
    size?: number;
}

interface IStateProps extends IPassedProps {
    classes: any;
}

interface IDispatchProps {}

interface IComponentState {}

interface IProps extends IStateProps, IDispatchProps {}

const styles = () => {
    return {
        logo: {
            color: 'white',
            display: 'block',
            margin: 'auto'
        }
    };
};

export default withStyles(styles, { withTheme: true })(
    class LogoComponent extends React.Component<IProps, IComponentState> {
        constructor(props: IProps) {
            super(props);

            this.state = {};
        }

        public render(): JSX.Element {
            const { classes } = this.props;

            return (
                // eslint-disable-next-line jsx-a11y/alt-text
                <object
                    data="/assets/logo.svg"
                    type="image/svg+xml"
                    className={classes.logo}
                    style={{
                        width: this.props.size
                            ? `${this.props.size}px`
                            : undefined
                    }}
                />
            );
        }
    }
);
