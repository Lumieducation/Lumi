/** @namespace H5PUpgrades */
var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.DocumentationTool'] = (function () {
  return {
    1: {
      7: function (parameters, finished, extras) {
        // Copy title to new metadata structure if present
        var metadata = {
          title: parameters.taskDescription || ((extras && extras.metadata) ? extras.metadata.title : undefined)
        };
        extras.metadata = metadata;

        finished(null, parameters, extras);
      }
    }
  };
})();
