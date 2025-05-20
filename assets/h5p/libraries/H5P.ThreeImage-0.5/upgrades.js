var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.ThreeImage'] = (function () {
  return {
    0: {
      2: function (parameters, finished) {
        if (parameters && parameters.context &&
            parameters.context.behaviour && parameters.context.behaviour.length) {
          // Add wrapper for audio
          const audio = parameters.context.behaviour;
          parameters.context.behaviour = {
            audio: audio
          };
        }
        finished(null, parameters);
      },
      4: function (parameters, finished) {
        if (parameters && parameters.behaviour) {
          parameters.behaviour.label = {
            showLabel: false,
            labelPosition: 'right'
          };
        }
        finished(null, parameters);
      }
    }
  };
})();
