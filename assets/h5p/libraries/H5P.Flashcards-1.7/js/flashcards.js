/**
 * Flashcards module.
 *
 * @param {H5P.jQuery} $
 */
H5P.Flashcards = (function ($, XapiGenerator) {

  C.counter = 0;

  /**
   * Initialize module.
   *
   * @param {Object} options Run parameters
   * @param {Number} id Content identification
   */
  function C(options, id) {
    H5P.EventDispatcher.call(this);
    this.answers = [];
    this.numAnswered = 0;
    this.contentId = this.id = id;
    this.options = $.extend({}, {
      description: "What does the card mean?",
      progressText: "Card @card of @total",
      next: "Next",
      previous: "Previous",
      checkAnswerText: "Check answer",
      showSolutionsRequiresInput: true,
      defaultAnswerText: "Your answer",
      correctAnswerText: "Correct",
      incorrectAnswerText: "Incorrect",
      showSolutionText: "Correct answer(s)",
      answerShortText: "A:",
      informationText: "Information",
      caseSensitive: false,
      randomCards: false,
      results: "Results",
      ofCorrect: "@score of @total correct",
      showResults: "Show results",
      retry: "Retry",
      cardAnnouncement: 'Incorrect answer. Correct answer was @answer',
      pageAnnouncement: 'Page @current of @total',
      correctAnswerAnnouncement: '@answer is correct!'
    }, options);
    this.$images = [];
    this.hasBeenReset = false;

    this.on('resize', this.resize, this);

    if (this.options.randomCards === true) {
      this.options.cards = this.shuffle(this.options.cards);
    }
  }

  C.prototype = Object.create(H5P.EventDispatcher.prototype);
  C.prototype.constructor = C;

  /**
   * Process HTML escaped string for use as attribute value,
   * e.g. for alt text or title attributes.
   *
   * @param {string} value
   * @return {string} WARNING! Do NOT use for innerHTML.
   */
  const massageAttributeOutput = value => {
    const dparser = new DOMParser().parseFromString(value, 'text/html');
    const div = document.createElement('div');
    div.innerHTML = dparser.documentElement.textContent;;
    return div.textContent || div.innerText || '';
  };

  /**
   * Append field to wrapper.
   *
   * @param {H5P.jQuery} $container
   */
  C.prototype.attach = function ($container) {
    var that = this;

    if (this.isRoot()) {
      this.setActivityStarted();
    }

    this.$container = $container
      .addClass('h5p-flashcards')
      .html('<div class="h5p-loading">Loading, please wait...</div>');

    // Load card images. (we need their size before we can create the task)
    var loaded = 0;
    var load = function () {
      loaded++;
      if (loaded === that.options.cards.length) {
        that.cardsLoaded();
      }
    };

    for (var i = 0; i < this.options.cards.length; i++) {
      var card = this.options.cards[i];

      if (card.image !== undefined) {
        const $image = $('<img>', {
          'class': 'h5p-clue',
          src: H5P.getPath(card.image.path, this.id),
        });
        if (card.imageAltText) {
          $image.attr('alt', massageAttributeOutput(card.imageAltText));
        }

        if ($image.get().complete) {
          load();
        }
        else {
          $image.on('load', load);
        }

        this.$images[i] = $image;
      }
      else {
        this.$images[i] = $('<div class="h5p-clue"></div>');
        load();
      }
    }

    $('body').on('keydown', function (event) {
      // The user should be able to use the arrow keys when writing his answer
      if (event.target.tagName === 'INPUT') {
        return;
      }

      // Left
      if (event.keyCode === 37) {
        that.previous();
      }

      // Right
      else if (event.keyCode === 39) {
        that.next();
      }
    });
  };

  /**
   * Checks if the user anwer matches an answer on the card
   * @private
   *
   * @param card The card
   * @param userAnswer The user input
   * @return {Boolean} If the answer is found on the card
   */
  function isCorrectAnswer(card, userAnswer, caseSensitive) {
    var answer = C.$converter.html(card.answer || '').text();

    if (!caseSensitive) {
      answer = (answer ? answer.toLowerCase() : answer);
      userAnswer = (userAnswer ? userAnswer.toLowerCase() : userAnswer);
    }

    return C.splitAlternatives(answer).indexOf(userAnswer, '') !== -1;
  }

  /**
   * Shuffle the cards.
   * @param {object} card Cards.
   */
  C.prototype.shuffle = function (cards) {
    let currentIndex = cards.length;
    let tmp;
    let randomIndex;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      tmp = cards[currentIndex];
      cards[currentIndex] = cards[randomIndex];
      cards[randomIndex] = tmp;
    }

    return cards;
  };

  /**
   * Get Score
   * @return {number}
   */
  C.prototype.getScore = function () {
    var that = this;

    return that.options.cards.reduce(function (sum, card, i) {
      return sum + (isCorrectAnswer(card, that.answers[i], that.options.caseSensitive) ? 1 : 0);
    }, 0);
  };

  /**
   * Get Score
   * @return {number}
   */
  C.prototype.getMaxScore = function () {
    return this.options.cards.length;
  };

  /**
   * Called when all cards has been loaded.
   */
  C.prototype.cardsLoaded = function () {
    var that = this;
    const descId = ++C.counter;

    var $inner = this.$container.html(
      '<div class="h5p-description" id="flashcards-description' + '-' + descId + '" title="' + this.options.description + '">' + this.options.description + '</div>' +
      '<div class="h5p-progress"></div>' +
      '<div class="h5p-inner" role="region" aria-labelledby="flashcards-description' + '-' + descId + '" aria-roledescription="carousel"></div>' +
      '<div class="h5p-navigation">' +
        '<button type="button" class="h5p-button h5p-previous h5p-hidden" tabindex="0" title="' + this.options.previous + '" aria-label="' + this.options.previous + '"></button>' +
        '<button type="button" class="h5p-button h5p-next" tabindex="0" title="' + this.options.next + '" aria-label="' + this.options.next + '"></button>'
    ).children('.h5p-inner');

    // Create visual progress and add accessibility attributes
    this.$visualProgress = $('<div/>', {
      'class': 'h5p-visual-progress',
      'role': 'progressbar',
      'aria-valuemax': '100',
      'aria-valuemin': (100 / this.options.cards.length).toFixed(2)
    }).append($('<div/>', {
      'class': 'h5p-visual-progress-inner'
    })).appendTo(this.$container);

    this.$progress = this.$container.find('.h5p-progress');

    // Add cards
    for (var i = 0; i < this.options.cards.length; i++) {
      this.addCard(i, $inner);
    }

    // Set current:
    this.setCurrent($inner.find('>:first-child'));

    // Find highest image and set task height.
    var height = 0;
    for (i = 0; i < this.$images.length; i++) {
      var $image = this.$images[i];

      if ($image === undefined) {
        continue;
      }

      var imageHeight = $image.height();
      if (imageHeight > height) {
        height = imageHeight;
      }
    }

    // Active buttons
    var $buttonWrapper = $inner.next();
    this.$nextButton = $buttonWrapper.children('.h5p-next').click(function () {
      that.next();
    });
    this.$prevButton = $buttonWrapper.children('.h5p-previous').click(function () {
      that.previous();
    });

    if (this.options.cards.length < 2) {
      this.$nextButton.hide();
    }

    this.$current.next().addClass('h5p-next');

    $inner.initialImageContainerWidth = $inner.find('.h5p-imageholder').outerWidth();

    this.addShowResults($inner);
    this.createResultScreen();

    this.$inner = $inner;
    this.setProgress();
    this.trigger('resize');

    // Attach aria announcer
    this.$ariaAnnouncer = $('<div>', {
      'class': 'hidden-but-read',
      'aria-live': 'assertive',
      appendTo: this.$container,
    });
    this.$pageAnnouncer = $('<div>', {
      'class': 'hidden-but-read',
      'aria-live': 'assertive',
      appendTo: this.$container
    });

    // Announce first page if task was reset
    if (this.hasBeenReset) {
      // Read-speaker needs a small timeout to be able to read the announcement
      setTimeout(function () {
        this.announceCurrentPage();
      }.bind(this), 100);
    }
  };

  /**
   * Add show results
   * @param {H5P.jQuery} $inner
   */
  C.prototype.addShowResults = function ($inner) {
    var that = this;

    var $showResults = $(
      '<div class="h5p-show-results">' +
        '<span class="h5p-show-results-icon"></span>' +
        '<button type="button" class="h5p-show-results-label">' + that.options.showResults + '</button>' +
        '<button type="button" class="h5p-show-results-label-mobile">' + that.options.results + '</button>' +
      '</div>'
    );

    $showResults
      .on('click', function () {
        that.enableResultScreen();
      })
      .appendTo($inner.parent());
  };

  /**
   * Add card
   * @param {number} index
   * @param {H5P.jQuery} $inner
   */
  C.prototype.addCard = function (index, $inner) {
    var that = this;
    var card = this.options.cards[index];
    const cardId = ++C.counter;

    // Generate a new flashcards html and add it to h5p-inner
    var $card = $(
      '<div role="group" aria-roledescription="slide" aria-labelledby="h5p-flashcard-card-' + cardId + '" class="h5p-card h5p-animate' + (index === 0 ? ' h5p-current' : '') + '"> ' +
        '<div class="h5p-cardholder">' +
          '<div class="h5p-imageholder">' +
            '<div class="h5p-flashcard-overlay" tabindex="-1">' +
            '</div>' +
          '</div>' +
          '<div class="h5p-foot">' +
            '<div class="h5p-imagetext" id="h5p-flashcard-card-' + cardId + '">' +
              (card.text !== undefined ? card.text : '') +
            '</div>' +
            '<div class="h5p-answer">' +
              '<div class="h5p-input">' +
                '<input type="text" class="h5p-textinput" tabindex="-1" placeholder="' + this.options.defaultAnswerText + '" aria-describedby="h5p-flashcard-card-' + cardId +'" autocomplete="off" spellcheck="false"/>' +
                '<button type="button" class="h5p-button h5p-check-button" tabindex="-1" title="' + this.options.checkAnswerText + '">' + this.options.checkAnswerText + '</button>' +
                '<button type="button" class="h5p-button h5p-icon-button" tabindex="-1" title="' + this.options.checkAnswerText + '"/>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>')
      .appendTo($inner);

    $card.find('.h5p-imageholder').prepend(this.$images[index]);

    $card.prepend($('<div class="h5p-flashcard-overlay" tabindex="-1"></div>').on('click', function () {
      
      // Set temporary focus
      $card.find('.h5p-flashcard-overlay').focus();
      
      if ($(this).parent().hasClass('h5p-previous')) {
        that.previous();
      }
      else {
        that.next();
      }
    }));

    // Add tip
    var $tip = H5P.JoubelUI.createTip(card.tip);
    if ($tip && $tip.length) { // Check for a jQuery object
      $tip.attr({
        tabindex: -1,
        title: this.options.informationText
      });
      $('.h5p-input', $card).append($tip).addClass('has-tip');
    }

    var $input = $card.find('.h5p-textinput');

    var handleClick = function () {
      var card = that.options.cards[index];
      var userAnswer = $input.val().trim();
      var userCorrect = isCorrectAnswer(card, userAnswer, that.options.caseSensitive);
      var done = false;

      if (userAnswer == '') {
        $input.focus();
      }

      if (!that.options.showSolutionsRequiresInput || userAnswer !== '' || userCorrect) {
        that.numAnswered++;
        
        // Set temporary focus
        $card.find('.h5p-flashcard-overlay').focus();
        
        $input.add(this).attr('disabled', true);

        that.answers[index] = userAnswer;
        that.triggerXAPI('interacted');

        if (userCorrect) {
          $input.parent()
            .addClass('h5p-correct')
            .append('<div class="h5p-feedback-label">' + that.options.correctAnswerText + '!</div>');
          $card.addClass('h5p-correct');

          $('<div class="h5p-solution">' +
            '<span class="solution-icon h5p-rotate-in"></span>' +
          '</div>').appendTo($card.find('.h5p-imageholder'));

          that.$ariaAnnouncer.html(that.options.correctAnswerAnnouncement.replace('@answer', userAnswer));
        }
        else {
          $input.parent()
            .addClass('h5p-wrong')
            .append('<span class="h5p-feedback-label">' + that.options.incorrectAnswerText + '!</span>');
          $card.addClass('h5p-wrong');

          $('<div class="h5p-solution">' +
            '<span class="solution-icon h5p-rotate-in"></span>' +
            '<span class="solution-text">' +
              (that.options.cards[index].answer ?
                that.options.showSolutionText + ': ' + C.splitAlternatives(that.options.cards[index].answer).join(', ') :
                '') + '</span>' +
          '</div>').appendTo($card.find('.h5p-imageholder'));

          const ariaText = that.options.cardAnnouncement.replace(
            '@answer',
            that.options.cards[index].answer
          );
          that.$ariaAnnouncer.html(ariaText);
        }

        done = (that.numAnswered >= that.options.cards.length);

        if (!done) {
          that.nextTimer = setTimeout(that.next.bind(that), 3500);
        }
        else {
          that.last();
        }
      }

      if (done) {
        that.trigger(XapiGenerator.getXapiEvent(that));
        that.trigger('resize');
      }
    };

    $card.find('.h5p-check-button, .h5p-icon-button').click(handleClick);

    $input.keypress(function (event) {

      if (event.keyCode === 13) {
        handleClick();
        return false;
      }
    });

    return $card;
  };

  /**
   * Create result screen
   */
  C.prototype.createResultScreen = function () {
    var that = this;

    // Create the containers needed for the result screen
    this.$resultScreen = $('<div/>', {
      'class': 'h5p-flashcards-results',
    });

    $('<div/>', {
      'class': 'h5p-results-title',
      'text': this.options.results
    }).appendTo(this.$resultScreen);

    $('<div/>', {
      'class': 'h5p-results-score'
    }).appendTo(this.$resultScreen);

    $('<ul/>', {
      'class': 'h5p-results-list'
    }).appendTo(this.$resultScreen);

    this.$retryButton = $('<button/>', {
      'class': 'h5p-results-retry-button h5p-invisible h5p-button',
      'text': this.options.retry
    }).on('click', function () {
      that.resetTask();
    }).appendTo(this.$resultScreen);
  };

  /**
   * Enable result screen
   */
  C.prototype.enableResultScreen = function () {
    this.$inner.addClass('h5p-invisible');
    this.$inner.siblings().addClass('h5p-invisible');
    this.$resultScreen.appendTo(this.$container).addClass('show');

    var ofCorrectText = this.options.ofCorrect
      .replace(/@score/g, '<span>' + this.getScore() + '</span>')
      .replace(/@total/g, '<span>' + this.getMaxScore() + '</span>');

    this.$resultScreen.find('.h5p-results-score').html(ofCorrectText);

    // Create a list representing the cards and populate them
    for (var i = 0; i < this.options.cards.length; i++) {
      var card = this.options.cards[i];
      var $resultsContainer = this.$resultScreen.find('.h5p-results-list');

      var userAnswer = this.answers[i];
      var userCorrect = isCorrectAnswer(card, userAnswer, this.options.caseSensitive);

      var $listItem = $('<li/>', {
        'class': 'h5p-results-list-item' + (!userCorrect ? ' h5p-incorrect' : '')
      }).appendTo($resultsContainer);

      var $imageHolder = $('<div/>', {
        'class': 'h5p-results-image-holder',
      }).appendTo($listItem);

      if (card.image != undefined) {
        $imageHolder.css('background-image', 'url("' + H5P.getPath(card.image.path, this.id) + '")');
      }
      else {
        $imageHolder.addClass('no-image');
      }

      $('<div/>', {
        'class': 'h5p-results-question',
        'html': card.text
      }).appendTo($listItem);

      var $resultsAnswer = $('<div/>', {
        'class': 'h5p-results-answer',
        'text': this.answers[i]
      }).appendTo($listItem);

      $resultsAnswer.prepend('<span>' + this.options.answerShortText + ' </span>');

      if (!userCorrect) {
        $resultsAnswer.append('<span> ' + this.options.showSolutionText + ': </span>');
        $resultsAnswer.append('<span class="h5p-correct">' + C.splitAlternatives(card.answer).join(', ') + '</span>');
      }

      $('<div/>', {
        'class': 'h5p-results-box'
      }).appendTo($listItem);
    }
    if (this.getScore() < this.getMaxScore()) {
      this.$retryButton.removeClass('h5p-invisible');
    }
  };

  /**
   * Set Progress
   */
  C.prototype.setProgress = function () {
    var index = this.$current.index();
    this.$progress.text((index + 1) + ' / ' + this.options.cards.length);
    this.$visualProgress
      .attr('aria-valuenow', ((index + 1) / this.options.cards.length * 100).toFixed(2))
      .find('.h5p-visual-progress-inner').width((index + 1) / this.options.cards.length * 100 + '%');
  };

  /**
   * Set card as current card.
   *
   * Adjusts classes and tabindexes for existing current card and new
   * card.
   *
   * @param {H5P.jQuery} $card
   *   Class to add to existing current card.
   */
  C.prototype.setCurrent = function ($card) {
    // Remove from existing card.
    if (this.$current) {
      this.$current.find('.h5p-textinput').attr('tabindex', '-1');
      this.$current.find('.joubel-tip-container').attr('tabindex', '-1');
      this.$current.find('.h5p-check-button').attr('tabindex', '-1');
      this.$current.find('.h5p-icon-button').attr('tabindex', '-1');
    }

    // Set new card
    this.$current = $card;

    /* We can't set focus on anything until the transition is finished.
       If we do, iPad will try to center the focused element while the transition
       is running, and the card will be misplaced */
    $card.one('transitionend', function () {
      if ($card.hasClass('h5p-current') && !$card.find('.h5p-textinput')[0].disabled) {
        $card.attr('aria-hidden', 'false');
        $card.find('.h5p-textinput').focus();
        $card.siblings().attr('aria-hidden', 'true');
      }
      setTimeout(function () {
        this.announceCurrentPage();
      }.bind(this), 500);
    }.bind(this));

    // Update card classes
    $card.removeClass('h5p-previous h5p-next');
    $card.addClass('h5p-current');

    $card.siblings()
      .removeClass('h5p-current h5p-previous h5p-next left right')
      .find('.h5p-rotate-in').removeClass('h5p-rotate-in');

    $card.prev().addClass('h5p-previous');
    $card.next('.h5p-card').addClass('h5p-next');

    $card.prev().prevAll().addClass('left');
    $card.next().nextAll().addClass('right');

    // Update tab indexes
    $card.find('.h5p-textinput').attr('tabindex', '0');
    $card.find('.h5p-check-button').attr('tabindex', '0');
    $card.find('.h5p-icon-button').attr('tabindex', '0');
    $card.find('.joubel-tip-container').attr('tabindex', '0');
  };

  /**
   * Announces current page to assistive technologies
   */
  C.prototype.announceCurrentPage = function () {
    const pageText = this.options.pageAnnouncement
      .replace('@current', this.$current.index() + 1)
      .replace('@total', this.options.cards.length.toString());
    this.$pageAnnouncer.text(pageText);
  };

  /**
   * Display next card.
   */
  C.prototype.next = function () {
    var that = this;
    var $next = this.$current.next();

    clearTimeout(this.prevTimer);
    clearTimeout(this.nextTimer);

    if (!$next.length) {
      return;
    }

    that.setCurrent($next);
    if (!that.$current.next('.h5p-card').length) {
      that.$nextButton.addClass('h5p-hidden');
    }
    that.$prevButton.removeClass('h5p-hidden');
    that.setProgress();

    if ($next.is(':last-child') && that.numAnswered == that.options.cards.length) {
      that.$container.find('.h5p-show-results').show();
    }
  };

  /**
   * Display previous card.
   */
  C.prototype.previous = function () {
    var that = this;
    var $prev = this.$current.prev();

    clearTimeout(this.prevTimer);
    clearTimeout(this.nextTimer);

    if (!$prev.length) {
      return;
    }

    that.setCurrent($prev);
    if (!that.$current.prev().length) {
      that.$prevButton.addClass('h5p-hidden');
    }
    that.$nextButton.removeClass('h5p-hidden');
    that.setProgress();
    that.$container.find('.h5p-show-results').hide();
  };

  /**
   * Display last card.
   */
  C.prototype.last = function () {
    var $last = this.$inner.children().last();
    this.setCurrent($last);
    this.$nextButton.addClass('h5p-hidden');
    if (this.options.cards.length > 1) {
      this.$prevButton.removeClass('h5p-hidden');
    }
    this.setProgress();
    this.$container.find('.h5p-show-results').show();
    this.trigger('resize');
  };

  /**
   * Resets the whole task.
   * Used in contracts with integrated content.
   * @private
   */
  C.prototype.resetTask = function () {
    this.numAnswered = 0;
    this.hasBeenReset = true;
    this.cardsLoaded();
    this.trigger('resize');
  };

  /**
   * Gather copyright information from cards.
   *
   * @returns {H5P.ContentCopyrights}
   */
  C.prototype.getCopyrights = function () {
    var info = new H5P.ContentCopyrights();

    // Go through cards
    for (var i = 0; i < this.options.cards.length; i++) {
      var image = this.options.cards[i].image;
      if (image !== undefined && image.copyright !== undefined) {
        var rights = new H5P.MediaCopyright(image.copyright);
        rights.setThumbnail(new H5P.Thumbnail(H5P.getPath(image.path, this.id), image.width, image.height));
        info.addMedia(rights);
      }
    }

    return info;
  };

  /**
   * Update the dimensions and imagesizes of the task.
   */
  C.prototype.resize = function () {
    var self = this;
    if (self.$inner === undefined) {
      return;
    }
    var maxHeight = 0;
    var maxHeightImage = 0;

    if (this.$inner.width() / parseFloat($("body").css("font-size")) <= 31) {
      self.$container.addClass('h5p-mobile');
    }
    else {
      self.$container.removeClass('h5p-mobile');
    }

    //Find container dimensions needed to encapsule image and text.
    self.$inner.children('.h5p-card').each(function () {
      var cardholderHeight = maxHeightImage + $(this).find('.h5p-foot').outerHeight();
      var $button = $(this).find('.h5p-check-button');
      var $tipIcon = $(this).find('.joubel-tip-container');
      var $textInput = $(this).find('.h5p-textinput');
      maxHeight = cardholderHeight > maxHeight ? cardholderHeight : maxHeight;

      // Handle scaling and positioning of answer button, textfield and info icon, depending on width of answer button.
      if ($button.outerWidth() > $button.parent().width() * 0.4) {
        $button.parent().addClass('h5p-exceeds-width');
        $tipIcon.attr("style", "");
        $textInput.attr("style", "");
      }
      else {
        $button.parent().removeClass('h5p-exceeds-width');
        $tipIcon.css('right', $button.outerWidth());
        var emSize = parseInt($textInput.css('font-size'));
        $textInput.css('padding-right', $button.outerWidth() + ($textInput.parent().hasClass('has-tip') ? emSize * 2.5 : emSize));
      }
    });

    if (this.numAnswered < this.options.cards.length) {
      //Resize cards holder
      var innerHeight = 0;
      this.$inner.children('.h5p-card').each(function () {
        if ($(this).height() > innerHeight) {
          innerHeight = $(this).height();
        }
      });

      this.$inner.height(innerHeight);
    }

    var freeSpaceRight = this.$inner.children('.h5p-card').last().css("marginRight");

    if (parseInt(freeSpaceRight) < 160) {
      this.$container.find('.h5p-show-results')
        .addClass('h5p-mobile')
        .css('width', '');
    }
    else if (freeSpaceRight != 'auto') {
      this.$container.find('.h5p-show-results')
        .removeClass('h5p-mobile')
        .width(freeSpaceRight);
    }
  };

  /**
   * Helps convert html to text
   * @type {H5P.jQuery}
   */
  C.$converter = $('<div/>');

  /**
   * Split text by / while respecting \/ as escaped /.
   * @param {string} text Text to split.
   * @param {string} [delimiter='/'] Delimiter.
   * @param {string} [escaper='\\'] Escape sequence, default: single backslash.
   * @return {string[]} Split text.
   */
  C.splitAlternatives = function (text, delimiter, escaper) {
    text = text || '';
    delimiter = delimiter || '/';
    escaper = escaper || '\\';

    while (text.indexOf(escaper + delimiter) !== -1) {
      text = text.replace(escaper + delimiter, '\u001a');
    }

    return text
      .split(delimiter)
      .map(function (element) {
        return element = element.replace(/\u001a/g, delimiter).trim();
      });
  };

  /**
   * Get xAPI data.
   * Contract used by report rendering engine.
   *
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
   */
  C.prototype.getXAPIData = function () {
    const xAPIEvent = XapiGenerator.getXapiEvent(this);
    return {
      statement: xAPIEvent.data.statement
    };
  };

  return C;
})(H5P.jQuery, H5P.Flashcards.xapiGenerator);
