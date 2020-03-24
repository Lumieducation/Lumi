import * as React from 'react';

// import superagent from 'superagent';

// import H5PPlayer from 'h5p-nodejs-library/build/src/H5PPlayer';

// import LinearProgress from '@material-ui/core/LinearProgress';

declare var window: any;

interface IPassedProps {
    id: number;
    metadata: any;
    parameters: any;
}

interface IStateProps extends IPassedProps {}

interface IDispatchProps {}

interface IProps extends IStateProps, IDispatchProps {}

// function libraryLoader(
//     machineName: string,
//     majorVersion: number,
//     minorVersion: number
// ): Promise<any> {
//     return superagent
//         .get(
//             `https://lumi.s3.eu-central-1.amazonaws.com/h5p/libraries/${machineName}-${majorVersion}.${minorVersion}/library.json`
//         )
//         .then(response => response.body);
// }

export default function H5PClientRenderer(props: IProps): JSX.Element {
    // const [h5p, setH5p] = React.useState();

    const { id } = props;
    // const player = new H5PPlayer(
    //     libraryLoader as any,
    //     {
    //         baseUrl: `https://lumi.s3.eu-central-1.amazonaws.com/run`,
    //         libraryUrl: `https://lumi.s3.eu-central-1.amazonaws.com/h5p/libraries`,
    //         scriptUrl: `https://lumi.s3.eu-central-1.amazonaws.com/h5p/core/js`,
    //         stylesUrl: `https://lumi.s3.eu-central-1.amazonaws.com/h5p/core/styles`
    //     },
    //     {
    //         ajax: {
    //             contentUserData: `http://api.lumi.run/v0/analytics?h5p_id=${id}`,
    //             setFinished: `http://api.lumi.run/v0/analytics?h5p_id=${id}`
    //         },
    //         postUserStatistics: true
    //     } as any,
    //     null
    // );

    // player.useRenderer(
    //     (model: any) => `<!doctype html>
    // <html class="h5p-iframe">
    // <head>
    //     <meta charset="utf-8">

    //     ${model.styles
    //         .map((style: string) => `<link rel="stylesheet" href="${style}"/>`)
    //         .join('\n    ')}
    //     ${model.scripts
    //         .map((script: string) => `<script src="${script}"></script>`)
    //         .join('\n    ')}

    //     <script>
    //         H5PIntegration = ${JSON.stringify(model.integration, null, 2)};
    //     </script>${model.customScripts}
    // </head>
    // <body>
    //     <div class="h5p-content" data-content-id="${model.contentId}"></div>
    // </body>
    // </html>`
    // );

    // player
    //     .render(`${id}`, parameters, metadata as any)
    //     .then((page: string) => setH5p(page));

    // if (!h5p) {
    //     return <LinearProgress />;
    // }
    return (
        <iframe
            title="H5PView"
            frameBorder={0}
            // width="100%"
            height="800px"
            // srcDoc={h5p}
            src={`http://api.lumi.run/v0/h5p/render?id=${id}`}
        />
    );
}
