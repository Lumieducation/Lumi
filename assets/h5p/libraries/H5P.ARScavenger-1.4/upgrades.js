var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.ARScavenger'] = (function () {
  return {
    1: {
      /**
       * Asynchronous content upgrade hook.
       * Move parameters.
       * @param {Object} parameters
       * @param {function} finished
       */
      1: function (parameters, finished, extras) {
        if (parameters) {
          if (parameters.titleScreen) {
            parameters.showTitleScreen = parameters.titleScreen.showTitleScreen;
            delete parameters.titleScreen.showTitleScreen;
          }
          if (parameters.endScreen) {
            parameters.showEndScreen = parameters.endScreen.showEndScreen;
            delete parameters.endScreen.showEndScreen;
          }
        }

        finished(null, parameters, extras);
      }
    }
  };
})();
