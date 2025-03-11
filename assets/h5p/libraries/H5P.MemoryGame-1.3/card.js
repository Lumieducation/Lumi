(function (MemoryGame, EventDispatcher, $) {

  /**
   * @private
   * @constant {number} WCAG_MIN_CONTRAST_AA_LARGE Minimum contrast ratio.
   * @see https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
   */
  const WCAG_MIN_CONTRAST_AA_LARGE = 3;

  /**
   * Controls all the operations for each card.
   *
   * @class H5P.MemoryGame.Card
   * @extends H5P.EventDispatcher
   * @param {Object} image
   * @param {number} contentId
   * @param {number} cardsTotal Number of cards in total.
   * @param {string} alt
   * @param {Object} l10n Localization
   * @param {string} [description]
   * @param {Object} [styles]
   * @param {string} id Unique identifier for card including original+match info.
   */
  MemoryGame.Card = function (image, contentId, cardsTotal, alt, l10n, description, styles, audio, id) {
    /** @alias H5P.MemoryGame.Card# */
    var self = this;

    this.id = id;

    // Keep track of tabbable state
    self.isTabbable = false;

    // Initialize event inheritance
    EventDispatcher.call(self);

    let path, width, height, $card, $wrapper, $image, removedState,
      flippedState, audioPlayer;

    /**
     * Process HTML escaped string for use as attribute value,
     * e.g. for alt text or title attributes.
     *
     * @param {string} value
     * @return {string} WARNING! Do NOT use for innerHTML.
     */
    const massageAttributeOutput = (value = 'Missing description') => {
      const dparser = new DOMParser().parseFromString(value, 'text/html');
      const div = document.createElement('div');
      div.innerHTML = dparser.documentElement.textContent;;

      return div.textContent || div.innerText;
    };

    self.buildDOM = () => {
      $wrapper = $('<li class="h5p-memory-wrap" tabindex="-1" role="button"><div class="h5p-memory-card">' +
                  '<div class="h5p-front"' + (styles && styles.front ? styles.front : '') + '>' + (styles && styles.backImage ? '' : '<span></span>') + '</div>' +
                  '<div class="h5p-back"' + (styles && styles.back ? styles.back : '') + '>' +
                    (path ? '<img src="' + path + '" alt="" style="width:' + width + ';height:' + height + '"/>' + (audioPlayer ? '<div class="h5p-memory-audio-button"></div>' : '') : '<i class="h5p-memory-audio-instead-of-image">') +
                  '</div>' +
                '</div></li>');

      $wrapper.on('keydown', (event) => {
        switch (event.code) {
          case 'Enter':
          case 'Space':
            self.flip();
            event.preventDefault();
            return;
          case 'ArrowRight':
            // Move focus forward
            self.trigger('next');
            event.preventDefault();
            return;
          case 'ArrowDown':
            // Move focus down
            self.trigger('down');
            event.preventDefault();
            return;
          case 'ArrowLeft':
            // Move focus back
            self.trigger('prev');
            event.preventDefault();
            return;
          case 'ArrowUp': // Up
            // Move focus up
            self.trigger('up');
            event.preventDefault();
            return;
          case 'End':
            // Move to last card
            self.trigger('last');
            event.preventDefault();
            return;
          case 'Home':
            // Move to first card
            self.trigger('first');
            event.preventDefault();
            return;
        }
      });

      $image = $wrapper.find('img');

      $card = $wrapper.children('.h5p-memory-card')
        .children('.h5p-front')
          .click(function (e) {
            e.stopPropagation();
            self.flip();
          })
          .end();

      if (audioPlayer) {
        $card.children('.h5p-back')
          .click(function () {
            if ($card.hasClass('h5p-memory-audio-playing')) {
              self.stopAudio();
            }
            else {
              audioPlayer.play();
            }
          })
      }
    }

    // alt = alt || 'Missing description'; // Default for old games
    alt = massageAttributeOutput(alt);

    if (image && image.path) {
      path = H5P.getPath(image.path, contentId);

      if (image.width !== undefined && image.height !== undefined) {
        if (image.width > image.height) {
          width = '100%';
          height = 'auto';
        }
        else {
          height = '100%';
          width = 'auto';
        }
      }
      else {
        width = height = '100%';
      }
    }

    if (audio) {
      // Check if browser supports audio.
      audioPlayer = document.createElement('audio');
      if (audioPlayer.canPlayType !== undefined) {
        // Add supported source files.
        for (var i = 0; i < audio.length; i++) {
          if (audioPlayer.canPlayType(audio[i].mime)) {
            var source = document.createElement('source');
            source.src = H5P.getPath(audio[i].path, contentId);
            source.type = audio[i].mime;
            audioPlayer.appendChild(source);
          }
        }
      }

      if (!audioPlayer.children.length) {
        audioPlayer = null; // Not supported
      }
      else {
        audioPlayer.controls = false;
        audioPlayer.preload = 'auto';

        var handlePlaying = function () {
          if ($card) {
            $card.addClass('h5p-memory-audio-playing');
            self.trigger('audioplay');
          }
        };
        var handleStopping = function () {
          if ($card) {
            $card.removeClass('h5p-memory-audio-playing');
            self.trigger('audiostop');
          }
        };
        audioPlayer.addEventListener('play', handlePlaying);
        audioPlayer.addEventListener('ended', handleStopping);
        audioPlayer.addEventListener('pause', handleStopping);
      }
    }

    this.buildDOM();

    /**
     * Get id of the card.
     * @returns {string} The id of the card. (originalIndex-sideNumber)
     */
    this.getId = () => {
      return self.id;
    };

    /**
     * Update the cards label to make it accessible to users with a readspeaker
     *
     * @param {boolean} isMatched The card has been matched
     * @param {boolean} announce Announce the current state of the card
     * @param {boolean} reset Go back to the default label
     */
    self.updateLabel = function (isMatched, announce, reset) {
      // Determine new label from input params
      const imageAlt = alt ? ` ${alt}`: '';

      let label = reset ?
        l10n.cardUnturned :
        `${l10n.cardTurned}${imageAlt}`;

      if (isMatched) {
        label = l10n.cardMatched + ' ' + label;
      }

      // Update the card's label
      $wrapper.attr('aria-label', l10n.cardPrefix
        .replace('%num', $wrapper.index() + 1)
        .replace('%total', cardsTotal) + ' ' + label);

      // Update disabled property
      $wrapper.attr('aria-disabled', reset ? null : 'true');

      // Announce the label change
      if (announce) {
        $wrapper.blur().focus(); // Announce card label
      }
    };

    /**
     * Flip card.
     *
     * Win 11 screen reader announces image's alt tag even though it never gets
     * focus and button provides aria-label. Therefore alt tag is only set when
     * card is turned.
     * @param {object} [params] Parameters.
     * @param {boolean} [params.restoring] True if card is being restored from a saved state.
     */
    self.flip = function (params = {}) {
      if (flippedState) {
        $wrapper.blur().focus(); // Announce card label again
        return;
      }

      $card.addClass('h5p-flipped');
      $image.attr('alt', alt);
      flippedState = true;

      if (audioPlayer && !params.restoring) {
        audioPlayer.play();
      }

      this.trigger('flip', { restoring: params.restoring });
    };

    /**
     * Flip card back.
     */
    self.flipBack = function () {
      self.stopAudio();
      self.updateLabel(null, null, true); // Reset card label
      $card.removeClass('h5p-flipped');
      $image.attr('alt', '');
      flippedState = false;
    };

    /**
     * Remove.
     */
    self.remove = function () {
      $card.addClass('h5p-matched');
      removedState = true;
    };

    /**
     * Reset card to natural state
     */
    self.reset = function () {
      self.stopAudio();
      self.updateLabel(null, null, true); // Reset card label
      flippedState = false;
      removedState = false;
      $card[0].classList.remove('h5p-flipped', 'h5p-matched');
    };

    /**
     * Get card description.
     *
     * @returns {string}
     */
    self.getDescription = function () {
      return description;
    };

    /**
     * Get image clone.
     *
     * @returns {H5P.jQuery}
     */
    self.getImage = function () {
      return $card.find('img').clone();
    };

    /**
     * Append card to the given container.
     *
     * @param {H5P.jQuery} $container
     */
    self.appendTo = function ($container) {
      $wrapper.appendTo($container);

      $wrapper.attr(
        'aria-label',
        l10n.cardPrefix
          .replace('%num', $wrapper.index() + 1)
          .replace('%total', cardsTotal) + ' ' + l10n.cardUnturned
      );
    };

    /**
     * Re-append to parent container.
     */
    self.reAppend = function () {
      var parent = $wrapper[0].parentElement;
      parent.appendChild($wrapper[0]);
    };

    /**
     * Make the card accessible when tabbing
     */
    self.makeTabbable = function () {
      if ($wrapper) {
        $wrapper.attr('tabindex', '0');
        this.isTabbable = true;
      }
    };

    /**
     * Prevent tabbing to the card
     */
    self.makeUntabbable = function () {
      if ($wrapper) {
        $wrapper.attr('tabindex', '-1');
        this.isTabbable = false;
      }
    };

    /**
     * Make card tabbable and move focus to it
     */
    self.setFocus = function () {
      self.makeTabbable();
      if ($wrapper) {
        $wrapper.focus();
      }
    };

    /**
     * Check if the card has been removed from the game, i.e. if has
     * been matched.
     */
    this.isRemoved = () => {
      return removedState ?? false;
    };

    /**
     * Determine whether card is flipped or not.
     * @returns {boolean} True if card is flipped, else false.
     */
    this.isFlipped = () => {
      return flippedState ?? false;
    }

    /**
     * Stop any audio track that might be playing.
     */
    self.stopAudio = function () {
      if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
      }
    };
  };

  // Extends the event dispatcher
  MemoryGame.Card.prototype = Object.create(EventDispatcher.prototype);
  MemoryGame.Card.prototype.constructor = MemoryGame.Card;

  /**
   * Check to see if the given object corresponds with the semantics for
   * a memory game card.
   *
   * @param {object} params
   * @returns {boolean}
   */
  MemoryGame.Card.isValid = function (params) {
    return (params !== undefined &&
             (params.image !== undefined &&
             params.image.path !== undefined) ||
           params.audio);
  };

  /**
   * Checks to see if the card parameters should create cards with different
   * images.
   *
   * @param {object} params
   * @returns {boolean}
   */
  MemoryGame.Card.hasTwoImages = function (params) {
    return (params !== undefined &&
             (params.match !== undefined &&
              params.match.path !== undefined) ||
           params.matchAudio);
  };

  /**
   * Determines the theme for how the cards should look
   *
   * @param {string} color The base color selected
   * @param {number} invertShades Factor used to invert shades in case of bad contrast
   */
  MemoryGame.Card.determineStyles = function (color, invertShades, backImage) {
    var styles =  {
      front: '',
      back: '',
      backImage: !!backImage
    };

    // Create color theme
    if (color) {
      const frontColor = shadeEnforceContrast(color, 43.75 * invertShades);
      const backColor = shade(frontColor, 12.75 * invertShades);

      styles.front += 'color:' + color + ';' +
                      'background-color:' + frontColor + ';' +
                      'border-color:' + frontColor +';';
      styles.back += 'color:' + color + ';' +
                     'background-color:' + backColor + ';' +
                     'border-color:' + frontColor +';';
    }

    // Add back image for card
    if (backImage) {
      var backgroundImage = "background-image:url('" + backImage + "')";

      styles.front += backgroundImage;
      styles.back += backgroundImage;
    }

    // Prep style attribute
    if (styles.front) {
      styles.front = ' style="' + styles.front + '"';
    }
    if (styles.back) {
      styles.back = ' style="' + styles.back + '"';
    }

    return styles;
  };

  /**
   * Get RGB color components from color hex value.
   *
   * @private
   * @param {string} color Color as hex value, e.g. '#123456`.
   * @returns {number[]} Red, green, blue color component as integer from 0-255.
   */
  const getRGB = function (color) {
    return [
      parseInt(color.substring(1, 3), 16),
      parseInt(color.substring(3, 5), 16),
      parseInt(color.substring(5, 7), 16)
    ];
  }


  /**
   * Compute luminance for color.
   *
   * @private
   * @see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
   * @param {string} color Color as hex value, e.g. '#123456`.
   * @returns {number} Luminance, [0-1], 0 = lightest, 1 = darkest.
   */
  const computeLuminance = function (color) {
    const rgba = getRGB(color)
      .map(function (v) {
        v = v / 255;

        return v < 0.03928 ?
          v / 12.92 :
          Math.pow((v + 0.055) / 1.055, 2.4);
      });

    return rgba[0] * 0.2126 + rgba[1] * 0.7152 + rgba[2] * 0.0722;
  }

  /**
   * Compute relative contrast between two colors.
   *
   * @private
   * @see https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
   * @param {string} color1 Color as hex value, e.g. '#123456`.
   * @param {string} color2 Color as hex value, e.g. '#123456`.
   * @returns {number} Contrast, [1-21], 1 = no contrast, 21 = max contrast.
   */
  const computeContrast = function (color1, color2) {
    const luminance1 = computeLuminance(color1);
    const luminance2 = computeLuminance(color2);

    return (
      (Math.max(luminance1, luminance2) + 0.05) /
      (Math.min(luminance1, luminance2) + 0.05)
    )
  }

  /**
   * Use shade function, but enforce minimum contrast
   *
   * @param {string} color Color as hex value, e.g. '#123456`.
   * @param {number} percent Shading percentage.
   * @returns {string} Color as hex value, e.g. '#123456`.
   */
  const shadeEnforceContrast = function (color, percent) {
    let shadedColor;

    do {
      shadedColor = shade(color, percent);

      if (shadedColor === '#ffffff' || shadedColor === '#000000') {
        // Cannot brighten/darken, make original color 5% points darker/brighter
        color = shade(color, -5 * Math.sign(percent));
      }
      else {
        // Increase shading by 5 percent
        percent = percent * 1.05;
      }
    }
    while (computeContrast(color, shadedColor) < WCAG_MIN_CONTRAST_AA_LARGE);

    return shadedColor;
  }

  /**
   * Convert hex color into shade depending on given percent
   *
   * @private
   * @param {string} color
   * @param {number} percent
   * @return {string} new color
   */
  var shade = function (color, percent) {
    var newColor = '#';

    // Determine if we should lighten or darken
    var max = (percent < 0 ? 0 : 255);

    // Always stay positive
    if (percent < 0) {
      percent *= -1;
    }
    percent /= 100;

    for (var i = 1; i < 6; i += 2) {
      // Grab channel and convert from hex to dec
      var channel = parseInt(color.substring(i, i + 2), 16);

      // Calculate new shade and convert back to hex
      channel = (Math.round((max - channel) * percent) + channel).toString(16);

      // Make sure to always use two digits
      newColor += (channel.length < 2 ? '0' + channel : channel);
    }

    return newColor;
  };

})(H5P.MemoryGame, H5P.EventDispatcher, H5P.jQuery);
