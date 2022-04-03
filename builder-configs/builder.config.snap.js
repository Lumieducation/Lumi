const base = require('../builder.config');

module.exports = {
    ...base,
    linux: {
        category: 'Utility',
        target: [{ target: 'snap', arch: ['x64'] }]
    },
    extraResources: 'platform-information/snap.json'
};
