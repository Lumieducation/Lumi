var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.SpeakTheWords'] = (function () {
  return {
    1: {
      /**
       * Makes incorrect and correct answer texts more visible
       *
       * @param parameters
       * @param finished
       */
      2: function (parameters, finished) {
        if (parameters.l10n) {
          if (parameters.l10n.incorrectAnswerText) {
            parameters.incorrectAnswerText = parameters.l10n.incorrectAnswerText;
            delete parameters.l10n.incorrectAnswerText;
          }

          if (parameters.l10n.correctAnswerText) {
            parameters.correctAnswerText = parameters.l10n.correctAnswerText;
            delete parameters.l10n.correctAnswerText;
          }
        }
        finished(null, parameters);
      }
    }
  }
})();
