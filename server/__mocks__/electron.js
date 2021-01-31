const path = require('path');

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
        }
    }
};
