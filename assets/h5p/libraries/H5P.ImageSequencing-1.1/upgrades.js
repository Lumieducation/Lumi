var H5PUpgrades = H5PUpgrades || {};
H5PUpgrades['H5P.ImageSequencing'] = (function () {
  return {
    1: {
      1: function (parameters, finished) {
        // Wrap summaries to allow tip.

        parameters.behaviour = {
          enableSolution: true,
          enableRetry: true,
          enableResume: true
        };

        parameters.l10n.showSolution = 'Show Solution';
        parameters.l10n.resume = 'Resume';
        parameters.l10n.audioNotSupported = 'Audio Not Supported';
        parameters.l10n.ariaPlay= 'Play the corresponding audio';
        parameters.l10n.ariaMoveDescription= 'Moved @cardDesc from @posSrc to @posDes';
        parameters.l10n.ariaCardDesc = 'sequencing item';


        finished(null, parameters);
      }
    }
  };
}) ();
