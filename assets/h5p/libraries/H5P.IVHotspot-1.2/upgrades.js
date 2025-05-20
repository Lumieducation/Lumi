/** @namespace H5PUpgrades */
var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.IVHotspot'] = (function ($) {
  return {
    1: {

      /**
       * Asynchronous content upgrade hook.
       * Upgrades content parameters to support IVHotspot 1.2.
       *
       * Makes sure that texts that has been flatten to string
       * is moved to the ariaLabel property of texts.
       *
       * @params {Object} parameters
       * @params {function} finished
       */
      2: function (parameters, finished) {

        // Move interactions into assets container
        if (parameters.texts && parameters.texts.length) {
          parameters.texts = {
            ariaLabel: parameters.texts,
            showTitle: false
          }
        }

        // Done
        finished(null, parameters);
      }
    }
  };
})(H5P.jQuery);
