var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.Dictation'] = (function () {
  return {
    1: {
      /**
       * Asynchronous content upgrade hook.
       *
       * Move parameters in Behavioural Settings.
       * Correct use of enableSolution => enableSolutionsButton
       *
       * @param {object} parameters
       * @param {function} finished
       * @param extras
       */
      1: function (parameters, finished, extras) {
        if (parameters && parameters.behaviour) {
          const behaviour = parameters.behaviour;

          behaviour.scoring = {
            ignorePunctuation: (typeof behaviour.ignorePunctuation === 'boolean') ? behaviour.ignorePunctuation : true,
            zeroMistakeMode: (typeof behaviour.zeroMistakeMode === 'boolean') ? behaviour.zeroMistakeMode : false,
            typoFactor: behaviour.typoFactor || '100'
          };

          behaviour.textual = {
            wordSeparator: behaviour.wordSeparator || ' ',
            overrideRTL: behaviour.overrideRTL || 'auto',
            autosplit: (typeof behaviour.autosplit === 'boolean') ? behaviour.autosplit : true
          };

          behaviour.feedbackPresentation = {
            customTypoDisplay: (typeof behaviour.customTypoDisplay === 'boolean') ? behaviour.customTypoDisplay : false,
            alternateSolution: behaviour.alternateSolution || 'first'
          };

          behaviour.enableSolutionsButton = (typeof behaviour.enableSolution === 'boolean') ? behaviour.enableSolution : true;

          delete behaviour.ignorePunctuation;
          delete behaviour.zeroMistakeMode;
          delete behaviour.typoFactor;
          delete behaviour.wordSeparator;
          delete behaviour.overrideRTL;
          delete behaviour.autosplit;
          delete behaviour.customTypoDisplay;
          delete behaviour.alternateSolution;
          delete behaviour.enableSolution;
        }

        finished(null, parameters, extras);
      }
    }
  };
})();
