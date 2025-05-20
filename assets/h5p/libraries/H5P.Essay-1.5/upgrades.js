var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.Essay'] = (function () {
  return {
    1: {
      /**
       * Asynchronous content upgrade hook.
       *
       * Add new default parameters.
       *
       * @param {Object} parameters
       * @param {function} finished
       */
      2: function (parameters, finished, extras) {
        parameters.media = {};
        parameters.behaviour.pointsHost = 1;
        parameters.ariaYourResult = 'You got @score out of @total points';
        parameters.ariaNavigatedToSolution = 'Navigated to newly included sample solution after textarea.';

        finished(null, parameters, extras);
      }
    }
  };
})();
