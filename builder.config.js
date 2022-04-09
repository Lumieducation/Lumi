module.exports = {
    appId: 'education.lumi.lumi',
    productName: 'Lumi',
    asar: true,
    icon: 'electron/assets/lumi.icns',
    files: [
        'build/**/*',
        'node_modules/**/*',
        'reporter-client/build/static/js/**/*',
        'scorm-client/**/*',
        'package.json',
        'h5p/**/*',
        'electron/**/*',
        'locales/**/*'
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
        target: [
            {
                target: 'dmg',
                arch: ['arm64', 'x64']
            },
            {
                target: 'zip',
                arch: ['arm64', 'x64']
            }
        ],
        hardenedRuntime: true
    },
    afterSign: 'scripts/notarize.js',
    win: {
        icon: 'electron/assets/lumi.png',
        fileAssociations: {
            ext: 'h5p',
            name: 'H5P'
        }
    },
    appx: {
        identityName: process.env.APPX_IDENTITY_NAME,
        applicationId: process.env.APPX_APPLICATION_ID,
        publisher: process.env.APPX_PUBLISHER,
        displayName: process.env.APPX_DISPLAY_NAME,
        publisherDisplayName: process.env.APPX_PUBLISHER_DISPLAY_NAME
    },
    nsis: {
        deleteAppDataOnUninstall: true
    },
    linux: {
        category: 'Utility'
    },
    dmg: {
        sign: false
    },
    publish: {
        provider: 'github',
        releaseType: 'release'
    }
};
