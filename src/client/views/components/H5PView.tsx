import * as React from 'react';

import Logger from '../../helpers/Logger';

const log = new Logger('components:H5PView');

interface IPassedProps {
    contentId: number;
}

interface IStateProps extends IPassedProps {}

interface IDispatchProps {}

interface IProps extends IStateProps, IDispatchProps {}

export default function H5PView(props: IProps): JSX.Element {
    const { contentId } = props;
    log.info(`rendering ${contentId}`);
    return (
        <iframe
            title="H5PView"
            frameBorder={0}
            width="100%"
            height="800px"
            src={`/api/v0/h5p/package/${contentId}/render`}
        />
    );
}
