/** @namespace H5PUpgrades */
var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.ExportableTextArea'] = (function () {
  return {
    1: {
      3: function (parameters, finished, extras) {
        var title;

        if (parameters) {
          title = parameters.label;
        }

        extras = extras || {};
        extras.metadata = extras.metadata || {};
        extras.metadata.title = (title) ? title.replace(/<[^>]*>?/g, '') : ((extras.metadata.title) ? extras.metadata.title : '');

        finished(null, parameters, extras);
      }
    }
  };
})();
