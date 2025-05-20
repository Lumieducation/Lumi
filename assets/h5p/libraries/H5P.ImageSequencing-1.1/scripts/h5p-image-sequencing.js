H5P.ImageSequencing = (function (EventDispatcher, $, UI) {

  /**
   * ImageSequencing - Constructor
   *
   * @extends H5P.EventDispatcher
   * @param {Object} parameters from semantics
   * @param {number} id         unique id given by the platform
   *
   */
  function ImageSequencing(parameters, id) {

    /** @alias H5P.ImageSequencing# */
    const that = this;
    that.isRetry = false;
    that.isRefresh = false;
    that.isShowSolution = false;
    that.isGamePaused = false;
    that.isAttempted = false;
    that.score = 0;

    that.params = $.extend(true, {}, {
      l10n:{
        showSolution: "ShowSolution",
        resume: "Resume",
        audioNotSupported: "Audio Error"
      }
    }, parameters);

    // Initialize event inheritance
    EventDispatcher.call(that);

    /**
     * getXAPIData - Get xAPI data.
     *
     * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
     * @returns {Object} xApi data statement
     */
    that.getXAPIData = function () {
      const xAPIEvent = that.createXAPIEventTemplate('answered');
      that.addQuestionToXAPI(xAPIEvent);
      that.addResponseToXAPI(xAPIEvent);
      return {
        statement: xAPIEvent.data.statement
      };
    };

    /**
     * addQuestionToXAPI - Add the question to the definition part of an xAPIEvent
     *
     * @param {H5P.XAPIEvent} xAPIEvent
     */
    that.addQuestionToXAPI = function (xAPIEvent) {
      const definition = xAPIEvent.getVerifiedStatementValue(
        ['object', 'definition']
      );
      definition.description = {
        'en-US': that.params.taskDescription
      };
      definition.type =
        'http://adlnet.gov/expapi/activities/cmi.interaction';
      definition.interactionType = 'sequencing';
      definition.correctResponsesPattern = [];
      definition.choices = [];

      that.sequencingCards.forEach(function (card, index) {
        definition.choices[index] = {
          'id': 'item_' + card.uniqueId + '',
          'description': {
            'en-US':  card.imageDesc
          }
        };

        if (index === 0) {
          definition.correctResponsesPattern[0] = 'item_' + card.uniqueId + '[,]';
        }
        else if (index === that.sequencingCards.length - 1) {
          definition.correctResponsesPattern[0] += 'item_' + card.uniqueId;
        }
        else {
          definition.correctResponsesPattern[0] += 'item_' + card.uniqueId + '[,]';
        }
      });
    };

    /**
     * Add the response part to an xAPI event.
     *
     * @param {H5P.XAPIEvent} xAPIEvent
     */
    that.addResponseToXAPI = function (xAPIEvent) {
      const maxScore = that.getMaxScore();
      const score = that.getScore();
      const success = (score === maxScore);
      let response = '';

      that.sequencingCards.forEach(function (card) {
        if (response !== '') {
          response += '[,]';
        }
        response += 'item_' + card.seqNo;
      });

      xAPIEvent.setScoredResult(score, maxScore, that, true, success);
      xAPIEvent.data.statement.result.response = response;
    };

    // implementing question contract.

    /**
     * Check whether user is able to play the game.
     *
     *  @return {boolean}
     */
    that.getAnswerGiven = function () {
      return that.isAttempted;
    };

    /**
     *  getScore - Return the score obtained.
     *
     * @return {number}
     */
    that.getScore = function () {
      return that.score;
    };

    /**
     * Turn the maximum possible score that can be obtained.
     *
     * @return {number}
     */
    that.getMaxScore = function () {
      return that.numCards;
    };

    /**
     * Check each card and disable audio if it is enabled.
     */
    that.stopAudio = function () {
      that.sequencingCards.forEach(function (card) {
        if (card.audio && card.audio.stop) {
          card.audio.stop();
          card.$audio.find('.h5p-audio-inner').addClass(
            'audio-disabled');
        }
      });
    };

    /**
     * Refresh the DOM for both retry and resume.
     *
     * @returns {type} Description
     */
    that.refreshTask = function () {
      that.isRefresh = true;
      that.isShowSolution = false;
      that.isGamePaused = false;

      that.score = 0;
      that.$progressBar.reset();

      that.$list.detach();
      if (that.$resumeButton) {
        that.$resumeButton = that.$resumeButton.detach();
      }
      if (that.$retryButton) {
        that.$retryButton = that.$retryButton.detach();
      }
      that.$feedbackContainer.removeClass('sequencing-feedback-show');


      that.buildCardsDOM();
      that.$submitButton.appendTo(that.$buttonContainer);
      if (that.params.behaviour.enableSolution) {
        that.$showSolutionButton.appendTo(that.$buttonContainer);
      }
      that.rebuildDOM();
      that.activateSortableFunctionality();
      that.$list.focus();
      that.sequencingCards[0].makeTabbable();
      that.trigger('resize');
    };

    /**
     * Restructure the game layout whenever needed.
     */
    that.rebuildDOM = function () {
      that.$list.appendTo(that.$wrapper);
      that.$footerContainer.appendTo(that.$wrapper);
      that.trigger('resize');
    };

    /**
     * Rebuild the cards list and register assoicated event handlers.
     *
     * @returns {type} Description
     */
    that.buildCardsDOM = function () {
      that.$list = $('<ul class="sortable" role="listbox" tabindex="0"/>');
      that.sequencingCards.forEach(function (card) {
        card.appendTo(that.$list);
        if (!that.isRefresh && !that.isShowSolution) {
          //else events are already registered.
          card.on('selected', function () {
            if (!that.isGamePaused) {
              that.timer.play();
            }
          });
          card.on('next', createItemChangeFocusHandler(1));
          card.on('prev', createItemChangeFocusHandler(-1));
        }
        if (that.isShowSolution) {
          card.setSolved();
        }
      });
    };

    /**
     * Create buttons for check, show solution, retry and resume.
     *
     * @param {string} name - Button title.
     * @param {string} icon - Fa icon name.
     * @param {string} param - Button text.
     * @param {function} callback - Callback function.
     *
     * @returns {JoubelUI.Button}
     */
    that.createButton = function (name, icon, param, callback) {
      return UI.createButton({
        title: name,
        click: callback,
        html: '<span><i class="fa fa-'+icon+'" aria-hidden="true"></i></span>&nbsp;' +
                param
      });
    };

    /**
     * Build the games different DOM Parts.
     */
    that.buildDOMFrame = function () {
      that.$taskDescription = $('<div/>',{
        class: 'h5p-task-description',
        tabindex: '0',
        html: that.params.taskDescription,
        'aria-label': that.params.altTaskDescription
      });

      that.buildCardsDOM();

      that.$timer = $('<span/>',{
        html: '<dt role="term" >' + that.params.l10n.timeSpent + '</dt >'+
          '<dd role="definition"  class="h5p-time-spent" >0:00</dd>'
      });

      that.$counter= $('<span/>', {
        html: '<span><dt role="term" >' +that.params.l10n.totalMoves + '</dt>' +
        '<dd role="definition" class="h5p-submits">0</dd>'
      });

      that.timer = new ImageSequencing.Timer(that.$timer.find('.h5p-time-spent'));
      that.counter = new ImageSequencing.Counter(that.$counter.find('.h5p-submits'));

      that.$progressBar = UI.createScoreBar(that.numCards, 'scoreBarLabel');

      that.$submitButton = that.createButton('submit', 'check', that.params.l10n.checkAnswer, that.gameSubmitted);
      if (that.params.behaviour.enableSolution) {
        that.$showSolutionButton = that.createButton('solution', 'eye', that.params.l10n.showSolution, that.showSolutions);
      }
      if (that.params.behaviour.enableRetry) {
        that.$retryButton = that.createButton('retry', 'undo', that.params.l10n.tryAgain, that.resetTask);
      }
      if (that.params.behaviour.enableResume) {
        that.$resumeButton = that.createButton('resume', 'redo', that.params.l10n.resume, that.resumeTask);
      }

      that.$statusContainer = $('<dl/>',{
        class: 'sequencing-status',
        title: 'game status',
        role: 'group',
        tabindex: '0'
      });

      that.$feedback = $('<div/>',{
        classs: 'feedback-element',
        tabindex: '0'
      });

      that.$footerContainer = $('<div class="footer-container" />');
      that.$feedbackContainer = $('<div class="sequencing-feedback"/>');
      that.$buttonContainer = $('<div class="sequencing-feedback-show" />');
    };

    /**
     * Activate the sortable functionality on the cards list.
     */
    that.activateSortableFunctionality = function () {
      that.$list.sortable({
        placeholder: 'sequencing-dropzone',
        tolerance: 'pointer',
        helper: 'clone',
        containment: that.$wrapper,

        start: function (event, ui) {
          $(ui.helper).addClass('ui-sortable-helper');
          that.timer.play();
          that.triggerXAPI('interacted');
        },

        stop: function (event, ui) {
          $(ui.helper).removeClass('ui-sortable-helper');
        },

        update: function () {
          const order = that.$list.sortable('toArray');
          that.sequencingCards = that.sequencingCards.map(function (card, index) {
            return (that.sequencingCards.filter(function (cardItem) {
              return cardItem.uniqueId === parseInt(order[index].split('_')[1]);
            }))[0];
          });
        },
      });

      // for preventing clicks on each sortable element
      that.$list.disableSelection();

      // capturing the drop event on sortable
      that.$list.find('li').droppable({
        drop: function () {
          that.counter.increment();
          that.isAttempted = true;
        }
      });
    };


    /**
     * Callback for when the user clicks on check button.
     */
    that.gameSubmitted = function () {
      that.isSubmitted = true;
      that.isGamePaused = true;
      that.timer.stop();
      that.$list.sortable('disable');
      that.stopAudio();

      that.sequencingCards.forEach(function (card, index) {
        if (index === card.seqNo) {
          that.score++;
          card.setCorrect();
        }
        else {
          card.setIncorrect();
        }
      });

      that.$progressBar.setScore(that.score);
      const scoreText = that.params.l10n.score
        .replace('@score', that.score)
        .replace('@total', that.numCards);
      that.$feedback.html(scoreText);

      that.$submitButton = that.$submitButton.detach();
      if (that.$showSolutionButton) {
        that.$showSolutionButton = that.$showSolutionButton.detach();
      }

      if (that.score !== that.numCards) {
        if (that.params.behaviour.enableRetry) {
          that.$retryButton.appendTo(that.$buttonContainer);
        }
        if (that.params.behaviour.enableResume) {
          that.$resumeButton.appendTo(that.$buttonContainer);
        }
      }
      that.$feedbackContainer.addClass('sequencing-feedback-show'); //show feedbackMessage
      that.$feedback.focus();

      /* xApi Section
      // either completed or answered xAPI is required. Assuming answerd , disabling completed
      // let completedEvent = that.createXAPIEventTemplate('completed');
      // completedEvent.setScoredResult(that.score, that.numCards, that,
      //   true, that.score ==== that.numCards);
      // completedEvent.data.statement.result.duration = 'PT' + (Math.round(
      //   that.timer.getTime() / 10) / 100) + 'S';
      // that.trigger(completedEvent);
      //for implementing question contract
      */

      const xAPIEvent = that.createXAPIEventTemplate('answered');
      that.addQuestionToXAPI(xAPIEvent);
      that.addResponseToXAPI(xAPIEvent);
      that.trigger(xAPIEvent);
      that.trigger('resize');
    };

    /**
     * Trigger when user clicks on show solution button
     */
    that.showSolutions = function () {
      that.isRefresh = true;
      that.isGamePaused = true;
      that.timer.stop();
      that.stopAudio();

      that.$list.detach();
      that.$submitButton= that.$submitButton.detach();
      that.$showSolution = that.$showSolutionButton.detach();

      // need to arrange the list in correct order
      that.sequencingCards.sort(function (a, b) {
        return a.seqNo - b.seqNo;
      });

      that.buildCardsDOM();
      if (that.params.behaviour.enableRetry) {
        that.$retryButton.appendTo(that.$buttonContainer);
      }
      that.rebuildDOM();
      that.$list.focus();
      that.sequencingCards[0].makeTabbable();
      that.trigger('resize');
    };

    /**
     * Reset the task to default values.
     */
    that.resetTask = function () {
      that.isRetry = true;
      that.timer.reset();
      that.counter.reset();
      H5P.shuffleArray(that.sequencingCards);
      that.refreshTask();
    };

    /**
     * Resume task that was interrupted before.
     */
    that.resumeTask = function () {
      that.isRetry = false;
      that.sequencingCards.forEach(function (card) {
        card.reset();
      });
      that.refreshTask();
    };

    /**
     * Handle keyboard focus.
     *
     * @param {number} direction +1 for forward and -1 for backward
     *
     * @returns {function} function that handles the focus changing functionality
     */
    const createItemChangeFocusHandler = function (direction) {
      return function () {
        const currentItem = this;

        for (let currentIndex = 0; currentIndex < that.numCards; currentIndex++) {
          if (that.sequencingCards[currentIndex] === currentItem) {
            const nextItem = that.sequencingCards[currentIndex + direction];
            const nextIndex = currentIndex + direction;
            if (!nextItem) {
              //end of list return
              return;
            }

            if (currentItem.isSelected) {
              if (that.isGamePaused) {
                //for disabling the effect of selection in show solution mode
                currentItem.setSelected();
                currentItem.makeUntabbable();
                nextItem.setFocus();
                return;
              }

              // swapping cards at currentIndex and nextIndex
              if (currentIndex < nextIndex) {
                that.sequencingCards[currentIndex].$card.insertAfter(that.sequencingCards[nextIndex].$card);
              }
              else {
                that.sequencingCards[nextIndex].$card.insertAfter(that.sequencingCards[currentIndex].$card);
              }
              that.sequencingCards[currentIndex] = that.sequencingCards.splice(nextIndex, 1, that.sequencingCards[currentIndex])[0];

              const tempDesc= currentItem.imageDesc?currentItem.imageDesc:that.params.l10n.ariaCardDesc;
              const moveDesc = that.params.l10n.ariaMoveDescription
                .replace('@cardDesc', tempDesc)
                .replace('@posSrc', currentIndex+1)
                .replace('@posDes', nextIndex+1);

              currentItem.$card.attr('aria-label', moveDesc);
              currentItem.setFocus();
              that.counter.increment();
              that.isAttempted = true;
              return false;
            }
            else {
              currentItem.makeUntabbable();
              nextItem.setFocus();
            }
          }
        }
      };
    };

    /**
     * Initialize the cards to be used in the game
     */

    // creating an array of unique identifiers for each card in the list
    const uniqueIndexes = Array
      .apply(null, {length: that.params.sequenceImages.length})
      .map(Function.call, Number);

    H5P.shuffleArray(uniqueIndexes);

    const extraParams = {
      audioNotSupported: that.params.l10n.audioNotSupported,
      ariaPlay: that.params.l10n.ariaPlay,
      ariaCardDesc: that.params.l10n.ariaCardDesc
    };

    that.sequencingCards = that.params.sequenceImages
      .filter(function (params) {
        return ImageSequencing.Card.isValid(params);
      })
      .map(function (params, i) {
        return new ImageSequencing.Card(params, id, i,
          extraParams, uniqueIndexes[i]);
      });

    H5P.shuffleArray(that.sequencingCards);
    that.numCards = that.sequencingCards.length;
    that.buildDOMFrame();

    /**
     * Attach this game's html to the given container.
     *
     *  @param {H5P.jQuery} $container
     */
    that.attach = function ($container) {

      that.triggerXAPI('attempted');
      that.$wrapper = $container.addClass('h5p-image-sequencing');

      if (that.$list.children().length) {
        // add elements to status container
        that.$timer.appendTo(that.$statusContainer);
        that.$counter.appendTo(that.$statusContainer);

        //add elements to feedbackContainer
        that.$feedback.appendTo(that.$feedbackContainer);
        that.$progressBar.appendTo(that.$feedbackContainer);

        //add elements to buttonContainer
        that.$submitButton.appendTo(that.$buttonContainer);
        if (that.params.behaviour.enableSolution) {
          that.$showSolutionButton.appendTo(that.$buttonContainer);
        }

        //append status and feedback and button containers to footer
        that.$statusContainer.appendTo(that.$footerContainer);
        that.$feedbackContainer.appendTo(that.$footerContainer);
        that.$buttonContainer.appendTo(that.$footerContainer);

        //append description , cards and footer to main container.
        that.$taskDescription.appendTo($container);
        that.$list.appendTo($container);
        that.$footerContainer.appendTo($container);

        that.sequencingCards[0].setFocus();
        that.activateSortableFunctionality();
        that.trigger('resize');
      }
    };
  }
  // Extends the event dispatcher
  ImageSequencing.prototype = Object.create(EventDispatcher.prototype);
  ImageSequencing.prototype.constructor = ImageSequencing;
  return ImageSequencing;

}) (H5P.EventDispatcher, H5P.jQuery, H5P.JoubelUI);
