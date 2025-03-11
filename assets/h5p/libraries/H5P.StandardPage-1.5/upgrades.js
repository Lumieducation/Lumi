/** @namespace H5PUpgrades */
var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.StandardPage'] = (function () {
  return {
    1: {
      4: function (parameters, finished, extras) {
        var title;

        if (parameters) {
          title = parameters.title;
        }

        extras = extras || {};
        extras.metadata = extras.metadata || {};
        extras.metadata.title = (title) ? title.replace(/<[^>]*>?/g, '') : ((extras.metadata.title) ? extras.metadata.title : 'Standard Page');

        finished(null, parameters, extras);
      }
    }
  };
})();
