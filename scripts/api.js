var fs = require('fs');
var path = require('path');
var CodeGen = require('swagger-typescript-codegen').CodeGen;

var editor = JSON.parse(
    fs.readFileSync(path.resolve('src/api/editor.json'), 'UTF-8')
);

var run = JSON.parse(
    fs.readFileSync(path.resolve('src/api/run.json'), 'UTF-8')
);

var editorSourceCode = CodeGen.getTypescriptCode({
    className: 'LumiEditorAPI',
    swagger: editor
});

var runSourceCode = CodeGen.getTypescriptCode({
    className: 'LumiRunAPI',
    swagger: run
});

fs.writeFile(
    path.resolve('src/api/editorAPI.ts'),
    editorSourceCode,
    (error, ok) => {
        console.log(error, ok);
    }
);

fs.writeFile(path.resolve('src/api/runAPI.ts'), runSourceCode, (error, ok) => {
    console.log(error, ok);
});
