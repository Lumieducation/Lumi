import { IIntegration } from '@lumieducation/h5p-server';

export default (
        marginX?: number,
        marginY?: number,
        maxWidth?: number,
        customCss?: string
    ) =>
    (
        integration: IIntegration,
        scriptsBundle: string,
        stylesBundle: string,
        contentId: string
    ): string => {
        let marginStyle = '';
        if (marginX !== undefined && marginY !== undefined) {
            marginStyle = `margin: ${marginY}px ${marginX}px;`;
        }
        let flexStyle = '';
        let widthStyle = '';
        if (maxWidth !== undefined) {
            flexStyle = `display: flex; justify-content: center;`;
            widthStyle = `max-width:${maxWidth}px;`;
        }
        return `<!doctype html>
<html class="h5p-iframe">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">  
  <script>H5PIntegration = ${JSON.stringify(integration)};
  ${scriptsBundle}</script>
  <script type="text/javascript" src="SCORM_API_wrapper.js"></script>
  <script type="text/javascript" src="h5p-adaptor.js"></script>
  <style>${stylesBundle}</style>
  ${customCss ? `<style>${customCss}</style>` : ''}
</head>
<body>
    <div style="${marginStyle}${flexStyle}">
        <div style="${widthStyle}" class="h5p-content lag" data-content-id="${contentId}"></div>        
    </div>  
</body>
</html>`;
    };
