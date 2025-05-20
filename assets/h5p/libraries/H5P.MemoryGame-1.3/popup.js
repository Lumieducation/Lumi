(function (MemoryGame, EventDispatcher, $) {

  /**
   * A dialog for reading the description of a card.
   * @see https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/
   *
   * @class H5P.MemoryGame.Popup
   * @extends H5P.EventDispatcher
   * @param {Object.<string, string>} l10n
   */
  MemoryGame.Popup = function (l10n) {
    // Initialize event inheritance
    EventDispatcher.call(this);

    /** @alias H5P.MemoryGame.Popup# */
    var self = this;

    var closed;

    const $popupContainer = $(
      '<div class="h5p-memory-obscure-content"><div class="h5p-memory-pop" role="dialog" aria-modal="true"><div class="h5p-memory-top"></div><div class="h5p-memory-desc h5p-programatically-focusable" tabindex="-1"></div><div class="h5p-memory-close" role="button" tabindex="0" title="' + (l10n.closeLabel || 'Close') + '" aria-label="' + (l10n.closeLabel || 'Close') + '"></div></div></div>'
      )
      .on('keydown', function (event) {
        if (event.code === 'Escape') {
          self.close(true);
          event.preventDefault();
        }
      })
      .hide();

    const $popup = $popupContainer.find('.h5p-memory-pop');
    const $top = $popupContainer.find('.h5p-memory-top');

    // Hook up the close button
    const $closeButton = $popupContainer
      .find('.h5p-memory-close')
      .on('click', function () {
        self.close(true);
      })
      .on('keydown', function (event) {
        if (event.code === 'Enter' || event.code === 'Space') {
          self.close(true);
          event.preventDefault();
        }
        else if (event.code === 'Tab') {
          event.preventDefault(); // Lock focus
        }
    });

    const $desc = $popupContainer
      .find('.h5p-memory-desc')
      .on('keydown', function (event) {
        if (event.code === 'Tab') {
          // Keep focus inside dialog
          $closeButton.focus();
          event.preventDefault();
        }
      });

    /**
     * Append the popup to a container.
     * @param {H5P.jQuery} $container Container to append to.
     */
    this.appendTo = ($container) => {
      $container.append($popupContainer);
    };

    /**
     * Show the popup.
     *
     * @param {string} desc
     * @param {H5P.jQuery[]} imgs
     * @param {function} done
     */
    self.show = function (desc, imgs, styles, done) {
      const announcement = '<span class="h5p-memory-screen-reader">' +
        l10n.cardMatchedA11y + '</span>' + desc;
      $desc.html(announcement);

      $top.html('').toggleClass('h5p-memory-two-images', imgs.length > 1);
      for (var i = 0; i < imgs.length; i++) {
        $('<div class="h5p-memory-image"' + (styles ? styles : '') + '></div>').append(imgs[i]).appendTo($top);
      }
      $popupContainer.show();
      $desc.focus();
      closed = done;
    };

    /**
     * Close the popup.
     *
     * @param {boolean} refocus Sets focus after closing the dialog
     */
    self.close = function (refocus) {
      if (closed !== undefined) {
        $popupContainer.hide();
        closed(refocus);
        closed = undefined;

        self.trigger('closed');
      }
    };

    /**
     * Sets popup size relative to the card size
     *
     * @param {number} fontSize
     */
    self.setSize = function (fontSize) {
      // Set image size
      $top[0].style.fontSize = fontSize + 'px';

      // Determine card size
      var cardSize = fontSize * 6.25; // From CSS

      // Set popup size
      $popupContainer[0].style.minWidth = (cardSize * 2.5) + 'px';
      $popupContainer[0].style.minHeight = cardSize + 'px';
    };

    this.getElement = () => {
      return $popup[0];
    }
  };

})(H5P.MemoryGame, H5P.EventDispatcher, H5P.jQuery);
