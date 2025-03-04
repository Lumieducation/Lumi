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

    return `
<!doctype html>
    <html class="h5p-iframe">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1"> 
        <script>H5PIntegration = ${JSON.stringify({
          ...integration,
          baseUrl: '.',
          url: '.',
          ajax: { setFinished: '', contentUserData: '' },
          saveFreq: false,
          libraryUrl: ''
        })};

        if (new URLSearchParams(window.location.search).get('embed') == 'true') {
            H5PIntegration.contents['cid-' + '${contentId}'].displayOptions.embed = false;
        } else {
            H5PIntegration.contents['cid-' + '${contentId}'].embedCode = '<iframe src="' + window.location.protocol + "//" + window.location.host + window.location.pathname + '?embed=true' + '" width=":w" height=":h" frameborder="0" allowfullscreen="allowfullscreen"></iframe>';
            H5PIntegration.contents['cid-' + '${contentId}'].resizeCode = '';
        }
            
        ${scriptsBundle}</script>
        <style>${stylesBundle}</style>
        ${customCss ? `<style>${customCss}</style>` : ''}
    </head>
    <body>
        <div style="${marginStyle}${flexStyle}">
            <div
                style="${widthStyle}"
                class="h5p-content lag" data-content-id="${contentId}"></div>        
        </div>        
    </body>
</html>`;
  };
