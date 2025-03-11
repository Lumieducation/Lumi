(function (ImageSequencing) {

  /**
   * ImageSequencing.Counter - Keeps track of the number of times the game is submitted.
   *
   * @class H5P.ImageSequencing.Counter
   * @param {H5P.jQuery} $container
   */
  ImageSequencing.Counter = function ($container) {

    /** @alias H5P.ImageSequencing.Counter# */
    const that = this;
    let current = 0;

    /**
     * update - update the counter
     * @private
     */
    const update = function () {
      $container.text(current);
    };

    /**
     * Increment the counter.
     */
    that.increment = function () {
      current++;
      update();
    };

    /**
     * Revert counter back to its natural state
     */
    that.reset = function () {
      current = 0;
      update();
    };
  };

}) (H5P.ImageSequencing);
