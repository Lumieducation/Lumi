module.exports = {
    appId: 'education.lumi.lumi',
    productName: 'Lumi',
    asar: false,
    icon: 'electron/assets/lumi.icns',
    files: [
        'build/**/*',
        'node_modules/**/*',
        'reporter-client/build/static/js/**/*',
        'package.json',
        'h5p/**/*',
        'electron/**/*'
    ],
    mac: {
        category: 'education.lumi.lumi',
        gatekeeperAssess: false,
        entitlements: 'electron/mac/entitlements.mac.plist',
        entitlementsInherit: 'electron/mac/entitlements.mac.plist',
        fileAssociations: {
            ext: 'h5p',
            name: 'H5P'
        },
        target: ['zip', 'dmg'],
        hardenedRuntime: true
    },
    afterSign: 'scripts/notarize.js',
    win: {
        icon: 'electron/assets/lumi.png',
        target: ['appx', 'nsis']
    },
    appx: {
        identityName: process.env.APPX_IDENTITY_NAME,
        applicationId: process.env.APPX_APPLICATION_ID,
        publisher: process.env.APPX_PUBLISHER,
        displayName: process.env.APPX_DISPLAY_NAME,
        publisherDisplayName: process.env.APPX_PUBLISHER_DISPLAY_NAME
    },
    linux: {
        category: 'Utility',
        target: ['AppImage', 'snap', 'deb', 'pacman']
    },
    dmg: {
        sign: false
    },
    publish: {
        provider: 'github',
        releaseType: 'release'
    }
};
