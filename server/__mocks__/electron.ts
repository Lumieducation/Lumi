import path from 'path';

module.exports = {
    dialog: {
        showOpenDialog: async (c) => {
            return {
                canceled: false,
                filePaths: [path.resolve('test', 'data', 'analytics')]
            };
        },
        showSaveDialogSync: (c) => {
            return path.resolve('test', 'data');
        },
        showMessageBox: async (c) => {
            return '';
        }
    },
    nativeImage: {
        createFromPath: (p) => p
    }
};
