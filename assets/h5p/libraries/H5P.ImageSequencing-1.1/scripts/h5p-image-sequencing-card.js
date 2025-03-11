(function (ImageSequencing, EventDispatcher, $) {

  /**
   * Controls all the operations for each image card.
   *
   * @class H5P.ImageSequencing.Card
   * @extends H5P.EventDispatcher
   * @param {Object} cardParams
   * @param {number} id
   * @param {number} seqNumber
   * @param {Object} extraParams
   * @param {number} uniqueId
   */
  ImageSequencing.Card = function (cardParams, id, seqNumber, extraParams, uniqueId) {

    /** @alias H5P.ImageSequencing.Card# */
    const that = this;
    const path = H5P.getPath(cardParams.image.path, id);
    const audio = cardParams.audio;

    that.imageDesc = cardParams.imageDescription || '';
    that.uniqueId = uniqueId;
    that.seqNo = seqNumber;
    that.isSelected = false;

    // Initialize event inheritance
    EventDispatcher.call(that);

    /**
     * Create a container with audio files.
     *
     * @return {H5P.jQuery}  $audioWrapper
     */
    that.createAudioWrapper = function () {
      let audioObj;
      const $audioWrapper = $('<div>', {
        'class': 'h5p-image-sequencing-audio-wrapper'
      });

      if (audio !== undefined) {
        const audioDefaults = {
          files: audio,
          audioNotSupported: extraParams.audioNotSupported
        };

        audioObj = new H5P.Audio(audioDefaults, id);
        audioObj.attach($audioWrapper);
        // Have to stop else audio will take up a socket pending forever in chrome.
        if (audioObj.audio && audioObj.audio.preload) {
          audioObj.audio.preload = 'none';
        }
      }
      else {
        $audioWrapper.addClass('hide');
      }
      that.audio = audioObj;
      return $audioWrapper;
    };

    /**
     * Assign the correctly positioned card with class correct.
     */
    that.setCorrect = function () {
      that.$card
        .removeClass('sequencing-incorrect')
        .addClass('sequencing-correct')
        .attr('aria-label', that.$card.attr('aria-label') + ' correct');
      that.$card.find('.sequencing-mark')
        .removeClass('sequencing-incorrect-mark')
        .addClass('sequencing-correct-mark');
    };

    /**
     * Mark the card as solved.
     */
    that.setSolved = function () {
      that.$card
        .removeClass('sequencing-incorrect')
        .addClass('sequencing-correct');
    };

    /*
     * Assign the incorrectly positioned card with class incorrect.
     */
    that.setIncorrect = function () {
      that.$card
        .removeClass('sequencing-correct')
        .addClass('sequencing-incorrect')
        .attr('aria-label', that.$card.attr('aria-label') + ' incorrect');
      that.$card
        .find('.sequencing-mark')
        .removeClass('sequencing-correct-mark')
        .addClass('sequencing-incorrect-mark');
    };

    /**
     * Reset each card to its default state.
     */
    that.reset = function () {
      that.$card
        .removeClass('sequencing-correct')
        .removeClass('sequencing-incorrect')
        .attr('aria-label', that.imageDesc || extraParams.ariaCardDesc);
      that.$card
        .find('.sequencing-mark')
        .removeClass('sequencing-correct-mark')
        .removeClass('sequencing-incorrect-mark');
    };

    /**
     * Toggle between selected and unselected states.
     */
    that.setSelected = function () {
      if (!that.isSelected) {
        that.isSelected = true;
        that.$card.addClass('selected');
        that.$card.attr('aria-selected', true);
        that.$audio
          .find('button')
          .attr('tabindex', '0')
          .attr('aria-label', extraParams.ariaPlay)
          .attr('role', 'button');
        that.trigger('selected');
      }
      else {
        that.isSelected = false;
        that.$card.removeClass('selected');
        that.$card.attr('aria-selected', '');
        that.$card.attr('aria-label', (that.imageDesc || extraParams.ariaCardDesc));
        that.$audio
          .find('button')
          .attr('tabindex', '-1')
          .attr('aria-label', '');
      }
    };

    /**
     * Make the card accessible when tabbing.
     */
    that.makeTabbable = function () {
      if (that.$card) {
        that.$card.attr('tabindex', '0');
      }
    };

    /**
     * Make card tabbable and move focus to it.
     */
    that.setFocus = function () {
      that.makeTabbable();
      that.$card.focus();
    };

    /**
     * Prevent tabbing to the card.
     */
    that.makeUntabbable = function () {
      if (that.$card) {
        that.$card.attr('tabindex', '-1');
      }
    };


    /**
     * Append card to the given container.
     *
     * @param {H5P.jQuery} $container
     */
    that.appendTo = function ($container) {
      that.$audio = that.createAudioWrapper();

      // Disable tabbing the audio button under normal circumstances
      that.$audio.find('button').attr('tabindex', '-1');
      const label = that.imageDesc || extraParams.ariaCardDesc;

      const $cardContainer = $('<li/>',{
        class: 'sequencing-item draggabled',
        id: 'item_' + that.uniqueId,
        role: 'option',
        'aria-label': label,
        html: '<span class="sequencing-mark"></span>'
      });

      const $image = $('<div/>',{
        class: 'image-container',
        html: '<img src="' + path + '"/>',
        alt: that.imageDesc
      });

      const $description = $('<div/>',{
        class: 'image-desc',
        'data-title': that.imageDesc,
        html: '<span class="text">' + that.imageDesc + '</span>'
      });

      // grouping audio and image in a group
      that.$sequencingElement = $('<span role="group" />')
        .append(that.$audio)
        .append($image)
        .append($description);
      $cardContainer.append(that.$sequencingElement);
      that.$card = $cardContainer;

      // for tooltip functionality
      $cardContainer.find('.image-desc').on('click', function () {
        const $this = $(this);
        if (this.offsetWidth < this.scrollWidth) {
          $this.tooltip('option', 'content', $this.find('.text').html());
          $this.tooltip( 'option', 'items', '[data-title]' );
        }
        $(this).tooltip('enable').tooltip('open');
      });

      $cardContainer.find('.image-desc').tooltip({
        items:'[data-title]',
        content: '',
        show: null,
        position: {
          my: 'left top',
          at: 'center bottom',
          collision: 'fit',
          using: function (position, feedback) {
            $(this).css(position);
            $('<div>')
              .addClass('arrow')
              .addClass(feedback.vertical)
              .addClass(feedback.horizontal)
              .appendTo(this);
          }
        },
        // disabled by default
        disabled: true,
        close: function () {
          $(this).tooltip('disable');
        }
      });

      that.$audio.on('keydown', function (event) {
        if (event.which === 13 || event.which === 32) {
          // play or stop the audio without affecting the card
          event.stopPropagation();
        }
      });

      that.$card.appendTo($container).on('keydown', function (event) {
        switch (event.which) {
          case 13: // Enter
          case 32: // Space
            that.setSelected();
            event.preventDefault();
            return;
          case 39: // Right
          case 40: // Down
            // Move focus forward
            that.trigger('next');
            event.preventDefault();
            return;
          case 37: // Left
          case 38: // Up
            // Move focus back
            that.trigger('prev');
            event.preventDefault();
            return;
          case 35:
            // Move to last card
            that.trigger('last');
            event.preventDefault();
            return;
          case 36:
            // Move to first card
            that.trigger('first');
            event.preventDefault();
            return;
        }
      });
    };
  };

  // Extends the event dispatcher
  ImageSequencing.Card.prototype = Object.create(EventDispatcher.prototype);
  ImageSequencing.Card.prototype.constructor = ImageSequencing.Card;

  /**
   * Check to see if the given object corresponds with the semantics for
   * a ImageSequencing image Card
   * @param {object} params
   * @returns {boolean}
   */
  ImageSequencing.Card.isValid = function (params) {
    return (params !== undefined && params.image !== undefined &&
      params.image.path !== undefined);
  };

}) (H5P.ImageSequencing, H5P.EventDispatcher, H5P.jQuery);
