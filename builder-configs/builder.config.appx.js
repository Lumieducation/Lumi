const base = require('../builder.config');

module.exports = {
    ...base,
    win: {
        ...base.win,
        target: [{ target: 'appx', arch: ['arm64', 'x64'] }]
    },
    extraResources: 'platform-information/win.appx.json'
};
