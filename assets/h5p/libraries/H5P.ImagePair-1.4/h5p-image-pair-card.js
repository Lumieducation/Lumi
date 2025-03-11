(function(ImagePair, EventDispatcher, $) {

  /**
   * Controls all the operations for each card.
   *
   * @class H5P.ImagePair.Card
   * @extends H5P.EventDispatcher
   * @param {Object} image
   * @param {number} id
   * @param {string} alt
   */

  ImagePair.Card = function(image, id, alt) {

    // @alias H5P.ImagePair.Card#
    var self = this;

    // Initialize event inheritance
    EventDispatcher.call(self);

    var path = H5P.getPath(image.path, id);

    alt = alt || 'Missing description';

    self.isPaired = false;

    var width, height;

    if (image.width !== undefined && image.height !== undefined) {
      if (image.width > image.height) {
        width = '100%';
        height = 'auto';
      } else {
        height = '100%';
        width = 'auto';
      }
    } else {
      width = height = '100%';
    }

    /**
     * get the image element of the current card
     * @public
     */
    self.getImage = function() {
      return self.$card.find('img').clone();
    };

    /**
     * set a card to correct state
     * @public
     */
    self.setCorrect = function() {
      self.$pairingMark.addClass('correct-mark');
      self.$front.addClass('pair-item-correct');
      self.$rear.addClass('pair-item-correct');
    };

    /**
     * set a card to incorrect state
     * @public
     */
    self.setIncorrect = function() {
      self.$pairingMark.addClass('incorrect-mark');
      self.$front.addClass('pair-item-incorrect');
      self.$rear.addClass('pair-item-incorrect');
    };

    /**
     * set  card to solved state
     * @public
     */
    self.setSolved = function() {
      self.$pairingMark.addClass('solved-mark');
      self.$front.addClass('pair-item-solved');
      self.$rear.addClass('pair-item-solved');
    };

    /**
     * set  card to selected state
     * @public
     */
    self.setSelected = function() {
      //for keyboard navigation
      self.isSelected = true;
      self.$card.addClass('h5p-image-pair-item-selected');
    };

    /**
     *remove  card from selected state
     * @public
     */
    self.removeSelected = function() {
      //for keyboard navigation
      self.isSelected = false;
      self.$card.removeClass('h5p-image-pair-item-selected');
    };



    /**
     * makTabbable - Make the card accessible when tabbing
     */

    self.makeTabbable = function() {
      if (self.$card) {
        self.$card.attr('tabindex', '0');
      }
    };


    /**
     *  Prevent tabbing to the card
     */
    self.makeUntabbable = function() {
      if (self.$card) {
        self.$card.attr('tabindex', '-1');
      }
    };

    /**
     *  Make card tabbable and move focus to it
     */
    self.setFocus = function() {
      self.makeTabbable();
      self.$card.focus();
    }

    /**
     * triggerd on mate when it is paired. make its droppable propery disabled
     * @public
     */
    self.transform = function() {
      // remove droppable property
      self.$card.removeClass('h5p-image-pair-item-hover').removeClass(
        'droppable').droppable("option", "disabled", true);
    };

    /**
     * triggered on card when it is paired with a mate
     * @public
     */

    self.disable = function() {

      //for keyboard navigation
      self.isPaired = true;
      self.$card.removeClass('h5p-image-pair-item-selected').addClass(
        'h5p-image-pair-item-disabled');
    };

    /**
     * triggered on mate when pairing happens
     * @public
     * @param {H5P.ImagePair.Card} pair
     */
    self.pair = function(pair) {

      self.srcImage = (self.srcImage) ? self.srcImage : self.getImage();
      self.$top = self.$card;
      self.$top.html('').toggleClass('h5p-image-pair-images-paired', true);
      self.$pairingMark = $('<span class="pairing-mark"></span>').appendTo(
        self.$top);
      self.$front = $(
        '<div class="card-paired front"><div class="h5p-image-pair-overlay"></div></div>'
      ).append(pair.getImage()).appendTo(self.$top);
      self.$rear = $(
        '<div class="card-paired"><div class="h5p-image-pair-overlay"></div></div>'
      ).append(self.srcImage).appendTo(self.$top);
      self.$card.replaceWith(self.$top);

      //while clicking on either of the paired cards, trigger detach
      self.$top.children('.card-paired').on('click', function() {
        pair.$card.removeClass('h5p-image-pair-item-disabled');
        self.detach();
      });

      self.$top.children('.card-paired').hover(function() {
        $(this).addClass('h5p-image-pair-item-hover');
        $(this).siblings('div').addClass('h5p-image-pair-item-hover');
      }, function() {
        $(this).removeClass('h5p-image-pair-item-hover');
        $(this).siblings('div').removeClass(
          'h5p-image-pair-item-hover');
      });

      self.isPaired = true;

    };

    /**
     * triggerd user clicks on either of the card that is currently paired
     * @public
     */
    self.detach = function() {
      self.isPaired = false;
      self.$card.removeClass('h5p-image-pair-images-paired').empty();
      $('<div class="image-container"></div>').append(self.srcImage).appendTo(
        self.$card);
      self.$card.removeClass('h5p-image-pair-item-selected').addClass(
        'droppable').removeClass('h5p-image-pair-item-hover').droppable(
        "option", "disabled", false);
      self.trigger('unpair');
    };

    /**
     * Append card to the given container.
     *
     * @param {H5P.jQuery} $container
     */
    self.appendTo = function($container) {

      self.$card = $('<li class="h5p-image-pair-item">' +
        '<div class="image-container">' +
        '<img src="' + path + '" alt="' + alt + '" style="width:' +
        width + ';height:' + height + '"/>' +
        '<div class="h5p-image-pair-overlay"></div>' +
        '</div>' +
        '</li>').appendTo($container);


      self.$card.on('keydown', function(event) {

        switch (event.which) {
          case 13: //enter
            self.trigger('makeSelection');
            event.preventDefault();
            return;
          case 32: //space
            //toggle between card container & mate container
            self.trigger('shiftContainer');
            event.preventDefault();
            return;
          case 39: //Right
          case 40: //Down
            if (self.isPaired) {
              // move to next pair
              self.trigger('nextPair');
            } else {
              // move to the next card/mate
              self.trigger('next');
            }
            return;
          case 37: //Left
          case 38: //Up
            if (self.isPaired) {
              //move to the previous pair
              self.trigger('prevPair');
            } else {
              // move to the previous card/mate
              self.trigger('prev');
            }
            return;
          case 35: //End
            if (self.isPaired) {
              // move to the last pair
              self.trigger('lastPair');
            } else {
              // move to the last card/mate
              self.trigger('last');
            }
            return;
          case 36: //Home
            if (self.isPaired) {
              // move to the first pair
              self.trigger('firstPair');
            } else {
              // move to the first card/mate
              self.trigger('first');
            }
            return;
        }
      });

      self.$card.click(function() {
        self.trigger('selected');
      }).end();

      self.$card.hover(function() {
        $(this).addClass('h5p-image-pair-item-hover');
      }, function() {
        $(this).removeClass('h5p-image-pair-item-hover');
      });
    };

  };

  // Extends the event dispatcher
  ImagePair.Card.prototype = Object.create(EventDispatcher.prototype);
  ImagePair.Card.prototype.constructor = ImagePair.Card;

  /**
   * Check to see if the given object corresponds with the semantics for
   * a image pair game card.
   *
   * @param {object} params
   * @returns {boolean}
   */
  ImagePair.Card.isValid = function(params) {
    return (params !== undefined &&
      params.image !== undefined &&
      params.image.path !== undefined);
  };

  /**
   * Checks to see if the card parameters should create cards with different
   * images.
   *
   * @param {object} params
   * @returns {boolean}
   */

  ImagePair.Card.hasTwoImages = function(params) {
    return (params !== undefined &&
      params.match !== undefined &&
      params.match.path !== undefined);
  };

})(H5P.ImagePair, H5P.EventDispatcher, H5P.jQuery);
