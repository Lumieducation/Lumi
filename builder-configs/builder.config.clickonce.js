const base = require('../builder.config');

module.exports = {
    ...base,
    win: {
        ...base.win,
        target: [{ target: 'nsis', arch: ['x64'] }]
    },
    extraResources: 'platform-information/win.clickonce.json'
};
