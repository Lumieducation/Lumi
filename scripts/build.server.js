const chalk = require('react-dev-utils/chalk');
var fs = require('fs');
var path = require('path');

var appPackage = require('../package');

const info = {
    version: process.env.VERSION || appPackage.version
};

console.log(`Building server`);

if (!process.env.VERSION) {
    console.log(
        chalk.yellow(
            'Failed to determine version via VERSION-environment-variable. - Falling back to package.json'
        )
    );
}

console.log(`Version: ${info.version}`);

fs.writeFileSync(
    path.resolve('src/info.ts'),
    `export default ${JSON.stringify(info)}`
);
