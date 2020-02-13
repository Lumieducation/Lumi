export default (model: any) => `
    ${model.styles
        .map((style: any) => `<link rel="stylesheet" href="${style}"/>`)
        .join('\n    ')}
    ${model.scripts
        .map((script: any) => `<script src="${script}"></script>`)
        .join('\n    ')}

    <script>
        H5PIntegration = ${JSON.stringify(model.integration, null, 2)};
    </script>${model.customScripts}
    <div class="h5p-content" data-content-id="${model.contentId}"></div>
`;
