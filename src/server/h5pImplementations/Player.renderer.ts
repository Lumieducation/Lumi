import { IPlayerModel } from 'h5p-nodejs-library';

export default (model: IPlayerModel) => `<!doctype html>
<html class="h5p-iframe">
<head>
    <meta charset="utf-8">
    
    ${model.styles
        .map((style) => `<link rel="stylesheet" href="${style}"/>`)
        .join('\n    ')}
    ${model.scripts
        .map((script) => `<script src="${script}"></script>`)
        .join('\n    ')}

    <script>
        H5PIntegration = ${JSON.stringify(model.integration, null, 2)};        
        let timeout = null;
        window.onresize = () => {
            if(timeout){
                clearTimeout(timeout);
            }
            timeout = setTimeout( () => {
                H5P.instances.forEach((instance) => {
                    instance.trigger('resize');
                });          
                timeout = null;
          }, 250);
        };
    </script>
</head>
<body>
    <div class="h5p-content" data-content-id="${model.contentId}"></div>
</body>
</html>`;
