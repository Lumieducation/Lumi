var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.Crossword'] = (function () {
  return {
    0: {
      /**
       * Asynchronous content upgrade hook.
       *
       * Add new background parameter, was black by default.
       * Add new scoreWords parameter, was false by default.
       *
       * @param {Object} parameters
       * @param {function} finished
       */
      2: function (parameters, finished, extras) {
        parameters.behaviour.backgroundColor = '#000000';
        parameters.behaviour.scoreWords = false;

        finished(null, parameters, extras);
      },
      /**
       * Asynchronous content upgrade hook.
       *
       * Add new applyPenalties parameter, was true by default.
       *
       * @param {Object} parameters
       * @param {function} finished
       */
      3: function (parameters, finished, extras) {
        parameters.behaviour.applyPenalties = true;

        finished(null, parameters, extras);
      },
      /**
       * Asynchronous content upgrade hook.
       *
       * Move options to new theme group.
       *
       * @param {Object} parameters
       * @param {function} finished
       */
      4: function (parameters, finished, extras) {
        if (parameters && parameters.behaviour) {
          parameters.theme = {
            backgroundColor: '#173354',
            gridColor: '#000000',
            cellBackgroundColor: '#ffffff',
            cellColor: '#000000',
            clueIdColor: '#606060',
            cellBackgroundColorHighlight: '#3e8de8',
            cellColorHighlight: '#ffffff',
            clueIdColorHighlight: '#e0e0e0'
          };

          if (parameters.behaviour.backgroundImage) {
            parameters.theme.backgroundImage = parameters.behaviour.backgroundImage;
          }
          delete parameters.behaviour.backgroundImage;

          if (parameters.behaviour.backgroundColor) {
            parameters.theme.backgroundColor = parameters.behaviour.backgroundColor;
          }
          delete parameters.behaviour.backgroundColor;
        }

        finished(null, parameters, extras);
      }
    }
  };
})();
