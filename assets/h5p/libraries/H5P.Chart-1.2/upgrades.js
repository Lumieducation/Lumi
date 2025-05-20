var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.Chart'] = (function () {
  return {
    1: {

      /**
       * Upgrades old background selector values to work with new
       * background selector
       *
       * @params {Object} parameters
       * @params {function} finished
       */
      1: function (parameters, finished) {
        parameters.listOfTypes.forEach(function (type) {
          type.color = '#' + type.color;
          type.fontColor = '#' + type.fontColor;
        });

        finished(null, parameters);
      }
    }
  };
})();
