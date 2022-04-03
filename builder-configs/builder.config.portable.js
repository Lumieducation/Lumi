const base = require('../builder.config');

module.exports = {
    ...base,
    win: {
        ...base.win,
        target: [{ target: 'portable', arch: ['arm64', 'x64', 'ia32'] }]
    },
    extraResources: 'platform-information/win.portable.json',
    artifactName: 'Lumi-${version}-portable-${arch}.${ext}'
};
