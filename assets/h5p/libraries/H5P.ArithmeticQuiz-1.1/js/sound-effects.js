H5P.ArithmeticQuiz.SoundEffects = (function () {
  let isDefined = false;

  var SoundEffects = {
    types: [
      'positive-short',
      'negative-short'
    ],
    sounds: [],
    muted: false
  };

  const players = {};

  /**
   * Setup defined sounds
   *
   * @return {boolean} True if setup was successfull, otherwise false
   */
  SoundEffects.setup = function (libraryPath) {
    if (isDefined) {
      return false;
    }
    isDefined = true;

    SoundEffects.types.forEach(async (type) => {
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
   * @param  {string} type  Name of the sound as defined in [SoundEffects.types]
   * @param  {number} delay Delay in milliseconds
   */
  SoundEffects.play = function (type, delay) {
    if (SoundEffects.muted === false) {
      if (!players[type]) {
        return;
      }
      setTimeout(function () {
        players[type].play();
      }, delay || 0);
    }
  };

  /**
   * Mute. Subsequent invocations of SoundEffects.play() will not make any sounds beeing played.
   */
  SoundEffects.mute = function () {
    SoundEffects.muted = true;
  };

  /**
   * Unmute
   */
  SoundEffects.unmute = function () {
    SoundEffects.muted = false;
  };

  return SoundEffects;
})();
