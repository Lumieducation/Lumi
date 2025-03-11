var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.SortParagraphs'] = (function () {
  return {
    0: {
      /**
       * Asynchronous content upgrade hook.
       *
       * Remove obsolete parameter
       *
       * @param {object} parameters Parameters.
       * @param {function} finished Callback.
       * @param {object} extras Extra parameters.
       */
      10: function (parameters, finished, extras) {
        if (parameters && parameters.behaviour) {
          delete parameters.behaviour.arrowsPositions;
        }

        finished(null, parameters, extras);
      }
    }
  };
})();
