/** @namespace H5PUpgrades */
var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.DocumentExportPage'] = (function () {
  return {
    1: {
      4: function (parameters, finished, extras) {
        extras = extras || {};
        extras.metadata = extras.metadata || {};

        if (parameters && parameters.title) {
          extras.metadata.title = parameters.title.replace(/<[^>]*>?/g, '');
        }
        else if (!extras.metadata.title) {
          extras.metadata.title = 'Document Export Page';
        }

        finished(null, parameters, extras);
      }
    }
  };
})();
