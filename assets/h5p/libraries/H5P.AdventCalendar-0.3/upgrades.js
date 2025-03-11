/** @namespace H5PUpgrades */
var H5PUpgrades = H5PUpgrades || {};

H5PUpgrades['H5P.AdventCalendar'] = (function () {
  return {
    0: {
      2: function (parameters, finished, extras) {
        parameters.a11y = parameters.a11y || {};

        parameters.a11y.mute = (parameters.l10n && parameters.l10n.mute) ? parameters.l10n.mute : 'Mute audio';
        parameters.a11y.unmute = (parameters.l10n && parameters.l10n.unmute) ? parameters.l10n.unmute : 'Unmute audio';
        parameters.a11y.closeWindow = (parameters.l10n && parameters.l10n.closeWindow) ? parameters.l10n.closeWindow : 'Close window';

        delete parameters.l10n;

        finished(null, parameters, extras);
      },
      3: function (parameters, finished, extras) {
        if (parameters) {
          parameters.modeDoorImage = 'manual'; // Was always manual before

          // Move visual settings to dedicated visuals group
          parameters.visuals = {};
          if (parameters.behaviour) {
            parameters.behaviour.modeDoorPlacement = 'fixed'; // Was always fixed before
            parameters.behaviour.doorPlacementRatio = '6x4'; // Was always 6x4 before
            if (parameters.behaviour.backgroundImage !== undefined) {
              parameters.visuals.backgroundImage = parameters.behaviour.backgroundImage;
              delete parameters.behaviour.backgroundImage;
            }

            if (parameters.behaviour.doorImageTemplate !== undefined) {
              parameters.visuals.doorImageTemplate = parameters.behaviour.doorImageTemplate;
              delete parameters.behaviour.doorImageTemplate;
            }
            if (parameters.behaviour.hideDoorBorder !== undefined) {
              parameters.visuals.hideDoorBorder = parameters.behaviour.hideDoorBorder;
              delete parameters.behaviour.hideDoorBorder;
            }
            else {
              parameters.visuals.hideDoorBorder = false;
            }
            if (parameters.behaviour.hideNumbers !== undefined) {
              parameters.visuals.hideNumbers = parameters.behaviour.hideNumbers;
              delete parameters.behaviour.hideNumbers;
            }
            else {
              parameters.visuals.hideNumbers = false;
            }
            if (parameters.behaviour.hideDoorKnobs !== undefined) {
              parameters.visuals.hideDoorKnobs = parameters.behaviour.hideDoorKnobs;
              delete parameters.behaviour.hideDoorKnobs;
            }
            else {
              parameters.visuals.hideDoorKnobs = false;
            }
            if (parameters.behaviour.hideDoorFrame !== undefined) {
              parameters.visuals.hideDoorFrame = parameters.behaviour.hideDoorFrame;
              delete parameters.behaviour.hideDoorFrame;
            }
            else {
              parameters.visuals.hideDoorFrame = false;
            }
            if (parameters.behaviour.snow !== undefined) {
              parameters.visuals.snow = parameters.behaviour.snow;
              delete parameters.behaviour.snow;
            }
            else {
              parameters.visuals.snow = false;
            }
          }
        }

        // Move audio settings to dedicated audio group
        parameters.audio = {};
        if (parameters.behaviour) {
          if (parameters.behaviour.backgroundMusic !== undefined) {
            parameters.audio.backgroundMusic = parameters.behaviour.backgroundMusic;
            delete parameters.behaviour.backgroundMusic;
          }
          if (parameters.behaviour.autoplay !== undefined) {
            parameters.audio.autoplay = parameters.behaviour.autoplay;
            delete parameters.behaviour.autoplay;
          }
          else {
            parameters.audio.autoplay = false;
          }
        }

        finished(null, parameters, extras);
      }
    }
  };
})();
