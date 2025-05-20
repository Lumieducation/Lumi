var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.Summary'] = (function () {
  return {
    1: {
      1: {
        contentUpgrade: function (parameters, finished) {
          // Wrap summaries to allow tip.
          if (parameters.summaries !== undefined) {
            for (var i = 0; i < parameters.summaries.length; i++) {
              parameters.summaries[i] = {
                summary: parameters.summaries[i]
              };
            }
          }

          finished(null, parameters);
        }
      },
      6: function (parameters, finished) {
        if (parameters.summaries !== undefined) {
          for (var i = 0; i < parameters.summaries.length; i++) {
            if (parameters.summaries[i].subContentId === undefined) {
              // NOTE: We avoid using H5P.createUUID since this is an upgrade script and H5P function may change in the
              // future
              parameters.summaries[i].subContentId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
                var random = Math.random() * 16 | 0, newChar = char === 'x' ? random : (random & 0x3 | 0x8);
                return newChar.toString(16);
              });
            }
          }
        }

        finished(null, parameters);
      },

      /**
       * Asynchronous content upgrade hook.
       * Upgrades content parameters to support Summary 1.8
       *
       * Move old feedback message to the new overall feedback system.
       *
       * @params {object} parameters
       * @params {function} finished
       */
      8: function (parameters, finished) {
        if (parameters && parameters.summary) {
          parameters.overallFeedback = [
            {
              'from': 0,
              'to': 100,
              'feedback': parameters.summary
            }
          ];

          delete parameters.summary;
        }

        finished(null, parameters);
      },
      10: function (parameters, finished, extras) {
        var title;

        if (parameters && parameters.intro) {
          title = parameters.intro;
        }

        extras = extras || {};
        extras.metadata = extras.metadata || {};
        extras.metadata.title = (title) ? title.replace(/<[^>]*>?/g, '') : ((extras.metadata.title) ? extras.metadata.title : 'Summary');

        finished(null, parameters, extras);
      }
    }
  };
})();
