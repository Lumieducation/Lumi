require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
    if (process.env.CSC_IDENTITY_AUTO_DISCOVERY !== 'false') {
        console.log('notarizing');
        const { electronPlatformName, appOutDir } = context;
        if (electronPlatformName !== 'darwin') {
            return;
        }

        const appName = context.packager.appInfo.productFilename;

        return await notarize({
            appBundleId: 'education.lumi.lumi',
            appPath: `${appOutDir}/${appName}.app`,
            appleId: process.env.APPLEID,
            appleIdPassword: process.env.APPLEIDPASSWORD
        });
    }

    console.log('Skipped notarization');
    return Promise.resolve();
};
