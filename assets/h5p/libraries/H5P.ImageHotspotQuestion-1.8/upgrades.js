var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.ImageHotspotQuestion'] = (function () {
  return {
    1: {
      8: function (parameters, finished, extras) {
        var extrasOut = extras || {};

        // Copy title to new metadata structure if present
        if (parameters.imageHotspotQuestion && parameters.imageHotspotQuestion.backgroundImageSettings) {
          var title = parameters.imageHotspotQuestion.backgroundImageSettings.questionTitle || ((extras && extras.metadata) ? extras.metadata.title : undefined);

          extrasOut.metadata = {
            title: title
          };

          // Remove old parameter
          delete parameters.imageHotspotQuestion.backgroundImageSettings.questionTitle;

          // Move image data out of array -- H5P semantics peculiarity
          parameters.imageHotspotQuestion.backgroundImageSettings = parameters.imageHotspotQuestion.backgroundImageSettings.backgroundImage;
        }

        finished(null, parameters, extrasOut);
      }
    }
  };
})();
