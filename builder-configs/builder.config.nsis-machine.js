const base = require('../builder.config');

module.exports = {
    ...base,
    win: {
        ...base.win,
        target: [{ target: 'nsis', arch: ['arm64', 'x64', 'ia32'] }]
    },
    nsis: {
        ...base.nsis,
        oneClick: false,
        perMachine: true,
        allowToChangeInstallationDirectory: true
    },
    extraResources: 'platform-information/win.machine.json',
    artifactName: 'Lumi-${version}-multiuser-${arch}.${ext}',
    publish: {
        ...base.publish,
        publishAutoUpdate: false
    }
};
