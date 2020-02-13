import Editor from './editorAPI';
import Run from './runAPI';

const api = {
    editor: new Editor(process.env.NODE_ENV === 'test' ? undefined : '/api/v1'),
    run: new Run(
        process.env.NODE_ENV === 'test' ? undefined : 'http://api.lumi.run'
    )
};
export default api;
