/** @namespace H5PUpgrades */
var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.Agamotto'] = (function () {
  return {
    1: {
      3: function (parameters, finished) {
        // Update image items
        if (parameters.items) {
          parameters.items = parameters.items.map( function (item) {
            // Create new image structure
            var newImage = {
              library: 'H5P.Image 1.0',
              // We avoid using H5P.createUUID since this is an upgrade script and H5P function may change
              subContentId: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
                var random = Math.random() * 16 | 0, newChar = char === 'x' ? random : (random & 0x3 | 0x8);
                return newChar.toString(16);
              }),
              params: {
                alt: item.labelText || '',
                contentName: 'Image',
                title: item.labelText || '',
                file: item.image
              }
            };

            // Compose new item
            item = {
              description: item.description,
              image: newImage,
              labelText: item.labelText
            };

            return item;
          });
        }

        finished(null, parameters);
      },

      4: function (parameters, finished, extras) {
        // Copy title to new metadata structure if present
        var metadata = {
          title: (extras && extras.metadata && extras.metadata.title) ? extras.metadata.title : parameters.title
        };
        extras.metadata = metadata;

        finished(null, parameters, extras);
      },

      /*
       * Move parameters to behaviour group
       * Remove old single a11y and make object
       */
      5: function (parameters, finished, extras) {
        parameters.behaviour = {
          startImage: 1,
          snap: parameters.snap || true,
          ticks: parameters.ticks || false,
          labels: parameters.labels || false,
          transparencyReplacementColor: parameters.transparencyReplacementColor || '#000000'
        };

        delete parameters.snap;
        delete parameters.ticks;
        delete parameters.labels;
        delete parameters.transparencyReplacementColor;

        parameters.a11y = {
        };

        finished(null, parameters, extras);
      },

      /*
       * Move l10n parameters to a11y group
       */
      6: function (parameters, finished, extras) {
        if (parameters.l10n && parameters.l10n.mute) {
          parameters.a11y.mute = parameters.l10n.mute;
        }

        if (parameters.l10n && parameters.l10n.unmute) {
          parameters.a11y.unmute = parameters.l10n.unmute;
        }

        delete parameters.l10n;

        finished(null, parameters, extras);
      }
    }
  };
})();
