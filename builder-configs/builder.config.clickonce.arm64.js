const base = require('../builder.config');

module.exports = {
    ...base,
    win: {
        ...base.win,
        target: [{ target: 'nsis', arch: [ 'arm64' ] }]
    },
    extraResources: 'platform-information/win.clickonce.arm.32bit.json',
    artifactName: 'Lumi-Setup-${version}-${arch}.${ext}',
    publish: {
        ...base.publish,
        publishAutoUpdate: false
    }
};
