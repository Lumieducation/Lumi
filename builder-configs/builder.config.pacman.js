const base = require('../builder.config');

module.exports = {
    ...base,
    linux: {
        category: 'Utility',
        target: [{ target: 'pacman', arch: ['arm64', 'x64'] }]
    },
    extraResources: 'platform-information/pacman.json'
};
