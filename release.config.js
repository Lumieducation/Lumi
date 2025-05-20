module.exports = {
  branches: ['master', { name: 'next', prerelease: 'beta' }],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/npm',
      {
        npmPublish: false // Ensure this is false if you don’t want to publish to npm
      }
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'package-lock.json'],
        message:
          'chore(release): ${nextRelease.version} \n\n${nextRelease.notes}'
      }
    ],
    '@semantic-release/github'
  ]
};
