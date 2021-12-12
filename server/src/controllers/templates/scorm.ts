import { IIntegration } from '@lumieducation/h5p-server';

export default function (
    integration: IIntegration,
    scriptsBundle: string,
    stylesBundle: string,
    contentId: string
): string {
    return `<!doctype html>
<html class="h5p-iframe">
<head>
  <meta charset="utf-8">                    
  <script>H5PIntegration = ${JSON.stringify(integration)};
  ${scriptsBundle}</script>
  <script type="text/javascript" src="SCORM_API_wrapper.js"></script>
  <script type="text/javascript" src="h5p-adaptor.js"></script>
  <style>${stylesBundle}</style>
</head>
<body>
  <div class="h5p-content lag" data-content-id="${contentId}"></div>                
</body>
</html>`;
}
