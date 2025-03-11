H5P.SingleChoiceSet = H5P.SingleChoiceSet || {};

H5P.SingleChoiceSet.SoundEffects = (function () {
  let isDefined = false;

  const SoundEffects = {
    types: [
      'positive-short',
      'negative-short'
    ]
  };

  const players = {};

  /**
   * Setup defined sounds
   *
   * @param {string} libraryPath
   * @return {boolean} True if setup was successfull, otherwise false
   */
  SoundEffects.setup = function (libraryPath) {
    if (isDefined) {
      return false;
    }
    isDefined = true;

    SoundEffects.types.forEach(async function (type) {
      const player = new Audio();
      const extension = player.canPlayType('audio/ogg') ? 'ogg' : 'mp3';
      const response = await fetch(libraryPath + 'sounds/' + type + '.' + extension);
      const data = await response.blob();
      player.src = URL.createObjectURL(data);
      players[type] = player;
    });

    return true;
  };

  /**
   * Play a sound
   *
   * @param  {string} type  Name of the sound as defined in [SoundEffects.types]{@link H5P.SoundEffects.SoundEffects#types}
   * @param  {number} delay Delay in milliseconds
   */
  SoundEffects.play = function (type, delay) {
    if (!players[type]) {
      return;
    }

    setTimeout(function () {
      players[type].play();
    }, delay || 0);
  };

  return SoundEffects;
})();
