H5P.MemoryGame = (function (EventDispatcher, $) {

  // We don't want to go smaller than 100px per card(including the required margin)
  var CARD_MIN_SIZE = 100; // PX
  var CARD_STD_SIZE = 116; // PX
  var STD_FONT_SIZE = 16; // PX
  var LIST_PADDING = 1; // EMs
  var numInstances = 0;

  /**
   * Memory Game Constructor
   *
   * @class H5P.MemoryGame
   * @extends H5P.EventDispatcher
   * @param {Object} parameters
   * @param {Number} id
   * @param {Object} [extras] Saved state, metadata, etc.
   * @param {object} [extras.previousState] The previous state of the game
   */
  function MemoryGame(parameters, id, extras) {
    /** @alias H5P.MemoryGame# */
    var self = this;

    this.previousState = extras.previousState ?? {};

    // Initialize event inheritance
    EventDispatcher.call(self);

    var flipped, timer, counter, popup, $bottom, $feedback, $wrapper, maxWidth, numCols, audioCard;
    var cards = [];
    var score = 0;
    numInstances++;

    // Add defaults
    parameters = $.extend(true, {
      l10n: {
        cardTurns: 'Card turns',
        timeSpent: 'Time spent',
        feedback: 'Good work!',
        tryAgain: 'Reset',
        closeLabel: 'Close',
        label: 'Memory Game. Find the matching cards.',
        labelInstructions: 'Use arrow keys left and right to navigate cards. Use space or enter key to turn card.',
        done: 'All of the cards have been found.',
        cardPrefix: 'Card %num of %total:',
        cardUnturned: 'Unturned. Click to turn.',
        cardTurned: 'Turned.',
        cardMatched: 'Match found.',
        cardMatchedA11y: 'Your cards match!',
        cardNotMatchedA11y: 'Your chosen cards do not match. Turn other cards to try again.'
      }
    }, parameters);

    // Filter out invalid cards
    parameters.cards = (parameters.cards ?? []).filter((cardParams) => {
      return MemoryGame.Card.isValid(cardParams);
    });

    /**
     * Get number of cards that are currently flipped and in game.
     * @returns {number} Number of cards that are currently flipped.
     */
    var getNumFlipped = () => {
      return cards
        .filter((card) => card.isFlipped() && !card.isRemoved())
        .length;
    };

    /**
     * Check if these two cards belongs together.
     *
     * @private
     * @param {H5P.MemoryGame.Card} card
     * @param {H5P.MemoryGame.Card} mate
     * @param {H5P.MemoryGame.Card} correct
     */
    var check = function (card, mate, correct) {
      if (mate !== correct) {
        ariaLiveRegion.read(parameters.l10n.cardNotMatchedA11y);
        return;
      }
      // Remove them from the game.
      card.remove();
      mate.remove();

      var isFinished = cards.every((card) => card.isRemoved());

      var desc = card.getDescription();
      if (desc !== undefined) {
        // Pause timer and show desciption.
        timer.pause();
        var imgs = [card.getImage()];
        if (card.hasTwoImages) {
          imgs.push(mate.getImage());
        }

        // Keep message for dialog modal shorter without instructions
        $applicationLabel.html(parameters.l10n.label);

        popup.show(desc, imgs, cardStyles ? cardStyles.back : undefined, function (refocus) {
          if (isFinished) {
            // Game done
            finished();
            card.makeUntabbable();
          }
          else {
            // Popup is closed, continue.
            timer.play();

            if (refocus) {
              card.setFocus();
            }
          }
        });
      }
      else if (isFinished) {
        // Game done
        finished();
        card.makeUntabbable();
      }
    };

    /**
     * Game has finished!
     * @param {object} [params] Parameters.
     * @param {boolean} [params.restoring] True if restoring state.
     * @private
     */
    var finished = function (params = {}) {
      if (!params.restoring) {
        timer.stop();
      }
      score = 1;

      if (parameters.behaviour && parameters.behaviour.allowRetry) {
        // Create retry button
        self.retryButton = createButton('reset', parameters.l10n.tryAgain || 'Reset', () => {
          removeRetryButton();
          self.resetTask(true);
        });
        self.retryButton.style.fontSize = (parseFloat($wrapper.children('ul')[0].style.fontSize) * 0.75) + 'px';
        
        const retryModal = document.createElement('div');
        retryModal.setAttribute('role', 'dialog');
        retryModal.setAttribute('aria-modal', 'true');
        retryModal.setAttribute('aria-describedby', 'modalDescription');
        retryModal.setAttribute('tabindex', -1);
        const status = document.createElement('div');
        status.style.width = '1px';
        status.style.height = '1px';
        status.setAttribute('id', 'modalDescription');
        status.innerText = `${$feedback[0].innerHTML} ${parameters.l10n.done} ${$status[0].innerText}`.replace(/\n/g, " ");
        retryModal.appendChild(status);
        retryModal.appendChild(self.retryButton);
        
        $bottom[0].appendChild(retryModal); // Add to DOM
        retryModal.focus();
      }
      $feedback.addClass('h5p-show'); // Announce
      
      if (!params.restoring) {
        self.trigger(self.createXAPICompletedEvent());
      }
    };

    /**
     * Remove retry button.
     * @private
     */
    const removeRetryButton = function () {
      if (!self.retryButton || self.retryButton.parentNode.parentNode !== $bottom[0]) {
        return; // Button not defined or attached to wrapper
      }
      self.retryButton.classList.add('h5p-memory-transout');
    };

    /**
     * Shuffle the cards and restart the game!
     * @private
     */
    var resetGame = function (moveFocus = false) {
      // Reset cards
      score = 0;
      flipped = undefined;

      // Remove feedback
      $feedback[0].classList.remove('h5p-show');

      popup.close();

      // Reset timer and counter
      timer.stop();
      timer.reset();
      counter.reset();

      flipBackCards();

      // Randomize cards
      H5P.shuffleArray(cards);
      
      setTimeout(() => {
        // Re-append to DOM after flipping back
        for (var i = 0; i < cards.length; i++) {
          cards[i].reAppend();
        }
        for (var j = 0; j < cards.length; j++) {
          cards[j].reset();
        }

        // Scale new layout
        $wrapper.children('ul').children('.h5p-row-break').removeClass('h5p-row-break');
        maxWidth = -1;
        self.trigger('resize');
        moveFocus && cards[0].setFocus();
        if (self.retryButton) {
          $bottom[0].removeChild(self.retryButton.parentNode);
        }
      }, 600);
    };

    /**
     * Game has finished!
     * @private
     */
    var createButton = function (name, label, action) {
      var buttonElement = document.createElement('button');
      buttonElement.classList.add('h5p-memory-' + name);
      buttonElement.innerHTML = label;
      buttonElement.addEventListener('click', action, false);
      return buttonElement;
    };

    /**
     * Flip back all cards unless pair found or excluded.
     * @param {object} [params] Parameters.
     * @param {H5P.MemoryGame.Card[]} [params.excluded] Cards to exclude from flip back.
     * @param {boolean} [params.keepPairs] True to keep pairs that were found.
     */
    var flipBackCards = (params = {}) => {
      cards.forEach((card) => {
        params.excluded = params.excluded ?? [];
        params.keepPairs = params.keepPairs ?? false;

        if (params.excluded.includes(card)) {
          return; // Skip the card that was flipped
        }

        if (params.keepPairs) {
          const mate = getCardMate(card);
          if (
            mate.isFlipped() && card.isFlipped() &&
            !params.excluded.includes(mate)
          ) {
            return;
          }
        }

        card.flipBack();
      });
    };

    /**
     * Get mate of a card.
     * @param {H5P.MemoryGame.Card} card Card.
     * @returns {H5P.MemoryGame.Card} Mate of the card.
     * @private
     */
    var getCardMate = (card) => {
      const idSegments = card.getId().split('-');

      return cards.find((mate) => {
        const mateIdSegments = mate.getId().split('-');
        return (
          idSegments[0] === mateIdSegments[0] &&
          idSegments[1] !== mateIdSegments[1]
        );
      });
    }

    /**
     * Adds card to card list and set up a flip listener.
     *
     * @private
     * @param {H5P.MemoryGame.Card} card
     * @param {H5P.MemoryGame.Card} mate
     */
    var addCard = function (card, mate) {
      card.on('flip', (event) => {
        self.answerGiven = true;

        if (getNumFlipped() === 3 && !event.data?.restoring) {
          // Flip back all cards except the one that was just flipped
          flipBackCards({ excluded: [card], keepPairs: true });
        }

        if (audioCard) {
          audioCard.stopAudio();
        }

        if (!event.data?.restoring) {
          popup.close();
          self.triggerXAPI('interacted');
          // Keep track of time spent
          timer.play();
        }

        // Announce the card unless it's the last one and it's correct
        var isMatched = (flipped === mate);
        var isLast = cards.every((card) => card.isRemoved());

        card.updateLabel(isMatched, !(isMatched && isLast));

        let okToCheck = false;
        
        if (flipped !== undefined) {
          var matie = flipped;
          // Reset the flipped card.
          flipped = undefined;

          if (!event.data?.restoring) {
            okToCheck = true;
          }
        }
        else {
          flipped = card;
        }

        if (!event.data?.restoring) {
          // Always return focus to the card last flipped
          for (var i = 0; i < cards.length; i++) {
            cards[i].makeUntabbable();
          }

          (flipped || card).makeTabbable();

          // Count number of cards turned
          counter.increment();
        }
        
        if (okToCheck) {
          check(card, matie, mate);
        }
      });

      card.on('audioplay', function () {
        if (audioCard) {
          audioCard.stopAudio();
        }
        audioCard = card;
      });

      card.on('audiostop', function () {
        audioCard = undefined;
      });

      /**
       * Create event handler for moving focus to next available card i
       * given direction.
       *
       * @private
       * @param {number} direction Direction code, see MemoryGame.DIRECTION_x.
       * @return {function} Focus handler.
       */
      var createCardChangeFocusHandler = function (direction) {
        return function () {

          // Get current card index
          const currentIndex = cards.map(function (card) {
            return card.isTabbable;
          }).indexOf(true);

          if (currentIndex === -1) {
            return; // No tabbable card found
          }

          // Skip cards that have already been removed from the game
          let adjacentIndex = currentIndex;
          do {
            adjacentIndex = getAdjacentCardIndex(adjacentIndex, direction);
          }
          while (adjacentIndex !== null && cards[adjacentIndex].isRemoved());

          if (adjacentIndex === null) {
            return; // No card available in that direction
          }

          // Move focus
          cards[currentIndex].makeUntabbable();
          cards[adjacentIndex].setFocus();
        };
      };

      // Register handlers for moving focus in given direction
      card.on('up', createCardChangeFocusHandler(MemoryGame.DIRECTION_UP));
      card.on('next', createCardChangeFocusHandler(MemoryGame.DIRECTION_RIGHT));
      card.on('down', createCardChangeFocusHandler(MemoryGame.DIRECTION_DOWN));
      card.on('prev', createCardChangeFocusHandler(MemoryGame.DIRECTION_LEFT));

      /**
       * Create event handler for moving focus to the first or the last card
       * on the table.
       *
       * @private
       * @param {number} direction +1/-1
       * @return {function}
       */
      var createEndCardFocusHandler = function (direction) {
        return function () {
          var focusSet = false;
          for (var i = 0; i < cards.length; i++) {
            var j = (direction === -1 ? cards.length - (i + 1) : i);
            if (!focusSet && !cards[j].isRemoved()) {
              cards[j].setFocus();
              focusSet = true;
            }
            else if (cards[j] === card) {
              card.makeUntabbable();
            }
          }
        };
      };

      // Register handlers for moving focus to first and last card
      card.on('first', createEndCardFocusHandler(1));
      card.on('last', createEndCardFocusHandler(-1));

      cards.push(card);
    };

    var cardStyles, invertShades;
    if (parameters.lookNFeel) {
      // If the contrast between the chosen color and white is too low we invert the shades to create good contrast
      invertShades = (parameters.lookNFeel.themeColor &&
                      getContrast(parameters.lookNFeel.themeColor) < 1.7 ? -1 : 1);
      var backImage = (parameters.lookNFeel.cardBack ? H5P.getPath(parameters.lookNFeel.cardBack.path, id) : null);
      cardStyles = MemoryGame.Card.determineStyles(parameters.lookNFeel.themeColor, invertShades, backImage);
    }

    // Determine number of cards to be used
    const numCardsToUse =
      Math.max(
        2,
        parseInt(parameters.behaviour?.numCardsToUse ?? parameters.cards.length)
      );

    // Create cards pool
    let cardsPool = parameters.cards
      .reduce((result, cardParams, index) => {
        // Create first card
        const cardOne = new MemoryGame.Card(cardParams.image, id, 2 * numCardsToUse, cardParams.imageAlt, parameters.l10n, cardParams.description, cardStyles, cardParams.audio, `${index}-1`);
        let cardTwo;

        if (MemoryGame.Card.hasTwoImages(cardParams)) {
          // Use matching image for card two
          cardTwo = new MemoryGame.Card(cardParams.match, id, 2 * numCardsToUse, cardParams.matchAlt, parameters.l10n, cardParams.description, cardStyles, cardParams.matchAudio, `${index}-2`);
          cardOne.hasTwoImages = cardTwo.hasTwoImages = true;
        }
        else {
          // Add two cards with the same image
          cardTwo = new MemoryGame.Card(cardParams.image, id, 2 * numCardsToUse, cardParams.imageAlt, parameters.l10n, cardParams.description, cardStyles, cardParams.audio, `${index}-2`);
        }

        return [...result, cardOne, cardTwo];
      }, []);

    let cardOrder;
    if (this.previousState.cards) {
      cardOrder = this.previousState.cards.map((cardState) => cardState.id);
    }
    else {
      while (cardsPool.length > 2 * numCardsToUse) {
        // Extract unique indexex from the current cardsPool
        const uniqueCardIndexes = Array.from(new Set(cardsPool.map(card => card.getId().split('-')[0])));
    
        // Remove cards with randomly selected index
        const indexToRemove = uniqueCardIndexes[Math.floor(Math.random() * uniqueCardIndexes.length)];
        cardsPool = cardsPool.filter(card => card.getId().split('-')[0] !== indexToRemove);
      }

      cardOrder = cardsPool.map((card) => card.getId());
      H5P.shuffleArray(cardOrder);
    }

    // Create cards to be used in the game
    cardOrder.forEach((cardId) => {
      const card = cardsPool.find((card) => card.getId() === cardId);
      const matchId = (cardId.split('-')[1] === '1') ?
        cardId.replace('-1', '-2') :
        cardId.replace('-2', '-1')

      const match = cardsPool.find((card) => card.getId() === matchId);
      addCard(card, match);
    });

    // Restore state of cards
    this.previousState.cards?.forEach((cardState) => {
      const card = cards.find((card) => card.getId() === cardState.id);
      if (!card) {
        return;
      }

      if (cardState.flipped) {
        card.flip({ restoring: true });
      }
      if (cardState.removed) {
        card.remove();
      }

      /*
        * Keep track of the flipped card. When restoring 1/3 flipped cards,
        * we need to ensure that the non-matching card is set as flipped
        */
      if (getNumFlipped() % 2 === 1) {
        flipped = cards
          .filter((card) => {
            return card.isFlipped() && !getCardMate(card).isFlipped();
          })
          .shift();
      }
    });

    // Ensure all cards are removed if state was stored during flip time period
    if (cards.every((card) => card.isFlipped())) {
      cards.forEach((card) => card.remove());
    }

    // Set score before DOM is attached to page
    if (cards.every((card) => card.isRemoved())) {
      score = 1;
    }

    // Build DOM elements to be attached later
    var $list = $('<ul/>', {
      role: 'application',
      'aria-labelledby': 'h5p-intro-' + numInstances
    });

    for (var i = 0; i < cards.length; i++) {
      cards[i].appendTo($list);
    }

    if (cards.length) {
      // Make first available card tabbable
      cards.filter((card) => !card.isRemoved())[0]?.makeTabbable();

      $applicationLabel = $('<div/>', {
        id: 'h5p-intro-' + numInstances,
        'class': 'h5p-memory-hidden-read',
        html: parameters.l10n.label + ' ' + parameters.l10n.labelInstructions,
      });

      $bottom = $('<div/>', {
        'class': 'h5p-programatically-focusable'
      });

      $feedback = $('<div class="h5p-feedback">' + parameters.l10n.feedback + '</div>').appendTo($bottom);

      // Add status bar
      var $status = $('<dl class="h5p-status">' +
                      '<dt>' + parameters.l10n.timeSpent + ':</dt>' +
                      '<dd class="h5p-time-spent"><time role="timer" datetime="PT0M0S">0:00</time><span class="h5p-memory-hidden-read">.</span></dd>' +
                      '<dt>' + parameters.l10n.cardTurns + ':</dt>' +
                      '<dd class="h5p-card-turns">0<span class="h5p-memory-hidden-read">.</span></dd>' +
                      '</dl>').appendTo($bottom);

      timer = new MemoryGame.Timer(
        $status.find('time')[0],
        this.previousState.timer ?? 0
      );

      counter = new MemoryGame.Counter(
        $status.find('.h5p-card-turns'),
        this.previousState.counter ?? 0
      );
      popup = new MemoryGame.Popup(parameters.l10n);

      popup.on('closed', function () {
        // Add instructions back
        $applicationLabel.html(parameters.l10n.label + ' ' + parameters.l10n.labelInstructions);
      });

      // Aria live region to politely read to screen reader
      ariaLiveRegion = new MemoryGame.AriaLiveRegion();
    }
    else {
      const $foo = $('<div/>')
        .text('No card was added to the memory game!')
        .appendTo($list);

      $list.appendTo($wrapper);
    }

    /**
     * Attach this game's html to the given container.
     *
     * @param {H5P.jQuery} $container
     */
    self.attach = function ($container) {
      this.triggerXAPI('attempted');

      // TODO: Only create on first attach!
      $wrapper = $container.addClass('h5p-memory-game').html('');
      if (invertShades === -1) {
        $container.addClass('h5p-invert-shades');
      }

      if (cards.length) {
        $applicationLabel.appendTo($wrapper);
        $list.appendTo($wrapper);
        $bottom.appendTo($wrapper);
        popup.appendTo($wrapper);
        $wrapper.append(ariaLiveRegion.getDOM());
        $wrapper.click(function (e) {
          if (!popup.getElement()?.contains(e.target)) {
            popup.close();
          }
        });
      }
      else {
        $list.appendTo($wrapper);
      }

      // resize to scale game size and check for finished game afterwards
      this.trigger('resize');
      window.requestAnimationFrame(() => {
        if (cards.length && cards.every((card) => card.isRemoved())) {
          finished({ restoring: true });
        }
      });

      self.attached = true;

      /*
       * DOM is only created here in `attach`, so it cannot necessarily be reset
       * by `resetTask` if using MemoryGame as subcontent after resuming.
       */
      if (this.shouldResetDOMOnAttach) {
        removeRetryButton();
        resetGame();
        this.shouldResetDOMOnAttach = false;
      }
    };

    /**
     * Will try to scale the game so that it fits within its container.
     * Puts the cards into a grid layout to make it as square as possible –
     * which improves the playability on multiple devices.
     *
     * @private
     */
    var scaleGameSize = function () {
      // Check how much space we have available
      var $list = $wrapper.children('ul');

      var newMaxWidth = parseFloat(window.getComputedStyle($list[0]).width);
      if (maxWidth === newMaxWidth) {
        return; // Same size, no need to recalculate
      }
      else {
        maxWidth = newMaxWidth;
      }

      // Get the card holders
      var $elements = $list.children();
      if ($elements.length < 4) {
        return; // No need to proceed
      }

      // Determine the optimal number of columns
      var newNumCols = Math.ceil(Math.sqrt($elements.length));

      // Do not exceed the max number of columns
      var maxCols = Math.floor(maxWidth / CARD_MIN_SIZE);
      if (newNumCols > maxCols) {
        newNumCols = maxCols;
      }

      if (numCols !== newNumCols) {
        // We need to change layout
        numCols = newNumCols;

        // Calculate new column size in percentage and round it down (we don't
        // want things sticking out…)
        var colSize = Math.floor((100 / numCols) * 10000) / 10000;
        $elements.css('width', colSize + '%').each(function (i, e) {
          $(e).toggleClass('h5p-row-break', i === numCols);
        });
      }

      // Calculate how much one percentage of the standard/default size is
      var onePercentage = ((CARD_STD_SIZE * numCols) + STD_FONT_SIZE) / 100;
      var paddingSize = (STD_FONT_SIZE * LIST_PADDING) / onePercentage;
      var cardSize = (100 - paddingSize) / numCols;
      var fontSize = (((maxWidth * (cardSize / 100)) * STD_FONT_SIZE) / CARD_STD_SIZE);

      // We use font size to evenly scale all parts of the cards.
      $list.css('font-size', fontSize + 'px');
      popup.setSize(fontSize);
      // due to rounding errors in browsers the margins may vary a bit…
    };

    /**
     * Get index of adjacent card.
     *
     * @private
     * @param {number} currentIndex Index of card to check adjacent card for.
     * @param {number} direction Direction code, cmp. MemoryGame.DIRECTION_x.
     * @returns {number|null} Index of adjacent card or null if not retrievable.
     */
    const getAdjacentCardIndex = function (currentIndex, direction) {
      if (
        typeof currentIndex !== 'number' ||
        currentIndex < 0 || currentIndex > cards.length - 1 ||
        (
          direction !== MemoryGame.DIRECTION_UP &&
          direction !== MemoryGame.DIRECTION_RIGHT &&
          direction !== MemoryGame.DIRECTION_DOWN &&
          direction !== MemoryGame.DIRECTION_LEFT
        )
      ) {
        return null; // Parameters not valid
      }

      let adjacentIndex = null;

      if (direction === MemoryGame.DIRECTION_LEFT) {
        adjacentIndex = currentIndex - 1;
      }
      else if (direction === MemoryGame.DIRECTION_RIGHT) {
        adjacentIndex = currentIndex + 1;
      }
      else if (direction === MemoryGame.DIRECTION_UP) {
        adjacentIndex = currentIndex - numCols;
      }
      else if (direction === MemoryGame.DIRECTION_DOWN) {
        adjacentIndex = currentIndex + numCols;
      }

      return (adjacentIndex >= 0 && adjacentIndex < cards.length) ?
        adjacentIndex :
        null; // Out of bounds
    }

    if (parameters.behaviour && parameters.behaviour.useGrid && numCardsToUse) {
      self.on('resize', () => {
        scaleGameSize();
        if (self.retryButton) {
          self.retryButton.style.fontSize = (parseFloat($wrapper.children('ul')[0].style.fontSize) * 0.75) + 'px';
        }
      });
    }

    /**
     * Determine whether the task was answered already.
     * @returns {boolean} True if answer was given by user, else false.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-1}
     */
    self.getAnswerGiven = () => {
      return self.answerGiven;
    }

    /**
     * Get the user's score for this task.
     *
     * @returns {Number} The current score.
     */
    self.getScore = function () {
      return score;
    };

    /**
     * Get the maximum score for this task.
     *
     * @returns {Number} The maximum score.
     */
    self.getMaxScore = function () {
      return 1;
    };

    /**
     * Create a 'completed' xAPI event object.
     *
     * @returns {Object} xAPI completed event
     */
    self.createXAPICompletedEvent = function () {
      var completedEvent = self.createXAPIEventTemplate('completed');
      completedEvent.setScoredResult(self.getScore(), self.getMaxScore(), self, true, true);
      completedEvent.data.statement.result.duration = 'PT' + (Math.round(timer.getTime() / 10) / 100) + 'S';
      return completedEvent;
    }

    /**
     * Contract used by report rendering engine.
     *
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
     *
     * @returns {Object} xAPI data
     */
    self.getXAPIData = function () {
      var completedEvent = self.createXAPICompletedEvent();
      return {
        statement: completedEvent.data.statement
      };
    };

    /**
     * Reset task.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-5}
     */
    self.resetTask = function (moveFocus = false) {
      if (self.attached) {
        resetGame(moveFocus);
      }
      else {
      /*
       * DOM is only created in `attach`, so it cannot necessarily be reset
       * here if using MemoryGame as subcontent after resuming. Schedule for
       * when DOM is attached.
       */
        this.shouldResetDOMOnAttach = true;
      }

      this.wasReset = true;
      this.answerGiven = false;
      this.previousState = {};
      delete this.cardOrder;
    };

    /**
     * Get current state.
     * @returns {object} Current state to be retrieved later.
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-7}
     */
    self.getCurrentState = () => {
      if (!this.getAnswerGiven()) {
        return this.wasReset ? {} : undefined;
      }

      cardsState = cards.map((card) => {
        const flipped = card.isFlipped();
        const removed = card.isRemoved();

        return {
          id: card.getId(),
          // Just saving some bytes in user state database table
          ...(flipped && { flipped: flipped }),
          ...(removed && { removed: removed })
        }
      });

      return {
        timer: timer.getTime(),
        counter: counter.getCount(),
        cards: cardsState
      }
    }
  }

  // Extends the event dispatcher
  MemoryGame.prototype = Object.create(EventDispatcher.prototype);
  MemoryGame.prototype.constructor = MemoryGame;

  /** @constant {number} DIRECTION_UP Code for up. */
  MemoryGame.DIRECTION_UP = 0;

  /** @constant {number} DIRECTION_LEFT Code for left. Legacy value. */
  MemoryGame.DIRECTION_LEFT = -1;

  /** @constant {number} DIRECTION_DOWN Code for down. */
  MemoryGame.DIRECTION_DOWN = 2;

  /** @constant {number} DIRECTION_DOWN Code for right. Legacy value. */
  MemoryGame.DIRECTION_RIGHT = 1

  /**
   * Determine color contrast level compared to white(#fff)
   *
   * @private
   * @param {string} color hex code
   * @return {number} From 1 to Infinity.
   */
  var getContrast = function (color) {
    return 255 / ((parseInt(color.substring(1, 3), 16) * 299 +
                   parseInt(color.substring(3, 5), 16) * 587 +
                   parseInt(color.substring(5, 7), 16) * 144) / 1000);
  };

  return MemoryGame;
})(H5P.EventDispatcher, H5P.jQuery);
