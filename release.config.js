module.exports = {
    branches: [{ name: 'beta', prerelease: 'beta' }, 'release'],
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/npm',
        [
            '@semantic-release/git',
            {
                assets: ['package.json'],
                message:
                    'chore(release): ${nextRelease.version} \n\n${nextRelease.notes}'
            }
        ],
        '@semantic-release/github'
    ]
};
