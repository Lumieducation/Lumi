import Editor from './editorAPI';

const api = {
    editor: new Editor(process.env.NODE_ENV === 'test' ? undefined : '/api/v1')
};
export default api;
