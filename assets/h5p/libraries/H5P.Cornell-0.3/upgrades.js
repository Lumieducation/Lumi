var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.Cornell'] = (function () {
  return {
    0: {
      /**
       * Asynchronous content upgrade hook.
       *
       * Remove behaviour settings.
       *
       * @param {object} parameters Parameters.
       * @param {function} finished Callback.
       * @param {object} extras Extras.
       */
      3: function (parameters, finished, extras) {
        if (parameters) {
          delete parameters.behaviour;
        }

        finished(null, parameters, extras);
      }
    }
  };
})();