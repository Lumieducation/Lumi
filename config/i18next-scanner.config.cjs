module.exports = {
  input: ['src/**/*.{ts,tsx}', '!**/node_modules/**'],
  output: './assets/translations/lumi',
  options: {
    debug: true,
    keySeparator: false,
    func: {
      list: ['translate'],
      extensions: ['.ts', '.tsx']
    },
    defaultValue: function (lng, ns, key) {
      return key;
    },
    removeUnusedKeys: true,
    sort: true,

    resource: {
      // The path to store resources. Relative to the path specified by `gulp.dest(path)`.
      savePath: function (lng, ns) {
        return lng + '.json';
      },

      // Specify the number of space characters to use as white space to insert into the output JSON string for readability purpose.
      jsonIndent: 2,

      // Normalize line endings to '\r\n', '\r', '\n', or 'auto' for the current operating system. Defaults to '\n'.
      // Aliases: 'CRLF', 'CR', 'LF', 'crlf', 'cr', 'lf'
      lineEnding: '\n'
    }
  }
};
