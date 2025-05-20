var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.SimpleMultiChoice'] = (function ($) {
  return {
    1: {
      1: function (params, finished) {
        if (params && params.alternatives) {
          for (var i = 0 ; i < params.alternatives.length; i++) {
            params.alternatives[i] = {
              text: params.alternatives[i],
              feedback: {
                chosenFeedback: '',
                notChosenFeedback: ''
              }
            }
          }
        }
        // Send it back
        finished(null, params);
      }
    }
  };
})(H5P.jQuery);
