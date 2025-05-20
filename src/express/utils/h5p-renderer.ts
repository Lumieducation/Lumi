import * as H5P from '@lumieducation/h5p-server';

export default function H5PPlayerHTMLRenderer(model: H5P.IPlayerModel): string {
  return `<!doctype html>
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
            window.H5PIntegration = ${JSON.stringify(
              model.integration,
              null,
              2
            )};
        </script>
    </head>
    <body>
        <div class="h5p-content" data-content-id="${model.contentId}"></div> 
    </body>
    </html>`;
}
