H5P.Summary = (function ($, Question, XApiEventBuilder, StopWatch) {

  var summaryId = 0;

  function Summary(options, contentId, contentData) {
    if (!(this instanceof H5P.Summary)) {
      return new H5P.Summary(options, contentId);
    }

    this.id = this.contentId = contentId;
    this.contentData = contentData;
    this.summaryId = summaryId;
    Question.call(this, 'summary');
    this.offset = 0;
    this.score = 0;
    this.progress = 0;
    this.answers = [];
    this.answer = [];
    this.errorCounts = [];

    summaryId += 1;

    /**
     * The key is panel index, returns an array of the answer indexes the user tried.
     *
     * @property {number[][]}
     */
    this.userResponses = [];

    /**
     * The first key is panel index, and the second key is data-bit, value is index in panel
     *
     * @property {number[][]}
     */
    this.dataBitMap = [];

    // Remove empty summary to avoid JS-errors
    if (options.summaries) {
      options.summaries = options.summaries.filter(function (element) {
        return element.summary !== undefined;
      });
    }

    if (contentData && contentData.previousState !== undefined &&
        contentData.previousState.progress !== undefined &&
        contentData.previousState.answers) {
      this.progress = contentData.previousState.progress || this.progress;
      this.answers = contentData.previousState.answers || this.answers;

      var currentProgress = this.progress;

      // Do not count score screen as an error
      if (this.progress >= options.summaries.length) {
        currentProgress = options.summaries.length - 1;
      }

      for (var i = 0; i <= currentProgress; i++) {
        if (this.errorCounts[i] === undefined) {
          this.errorCounts[i] = 0;
        }
        if (this.answers[i]) {
          this.score += this.answers[i].length;
          this.errorCounts[i]++;
        }
      }
    }
    var that = this;

    /**
     * @property {StopWatch[]} Stop watches for tracking duration of slides
     */
    this.stopWatches = [];
    this.startStopWatch(this.progress);

    this.options = H5P.jQuery.extend({}, {
      overallFeedback: [],
      resultLabel: "Your result:",
      intro: "Choose the correct statement.",
      solvedLabel: "Solved:",
      scoreLabel: "Wrong answers:",
      labelCorrect: "Correct.",
      labelIncorrect: 'Incorrect! Please try again.',
      labelCorrectAnswers: "List of correct answers.",
      alternativeIncorrectLabel: 'Incorrect',
      postUserStatistics: (H5P.postUserStatistics === true),
      tipButtonLabel: 'Show tip',
      scoreBarLabel: 'You got :num out of :total points',
      progressText: 'Progress :num of :total'
    }, options);

    this.summaries = that.options.summaries;

    // Prevent the score bar from interrupting the progress counter
    this.setBehaviour({disableReadSpeaker: true});

    // Required questiontype contract function
    this.showSolutions = function() {
      // intentionally left blank, no solution view exists
    };

    // Required questiontype contract function
    this.getMaxScore = function() {
      return this.summaries ? this.summaries.length : 0;
    };

    this.getScore = function() {
      var self = this;

      // count single correct answers
      return self.summaries ? self.summaries.reduce(function(result, panel, index){
        var userResponse = self.userResponses[index] || [];

        return result + (self.correctOnFirstTry(userResponse) ? 1 : 0);
      }, 0) : 0;
    };

    this.getTitle = function() {
      return H5P.createTitle((this.contentData && this.contentData.metadata && this.contentData.metadata.title) ? this.contentData.metadata.title: 'Summary');
    };

    this.getCurrentState = function () {
      return {
        progress: this.progress || null,
        answers: this.answers
      };
    };
  }

  Summary.prototype = Object.create(Question.prototype);
  Summary.prototype.constructor = Summary;

  /**
   * Registers DOM elements before they are attached.
   * Called from H5P.Question.
   */
  Summary.prototype.registerDomElements = function () {
    // Register task content area
    this.setContent(this.createQuestion());
  };

  // Function for attaching the multichoice to a DOM element.
  Summary.prototype.createQuestion = function() {
    var that = this;
    var id = 0; // element counter
    // variable to capture currently focused option.
    var currentFocusedOption;
    var elements = [];
    var $ = H5P.jQuery;
    this.$myDom = $('<div>', {
      'class': 'summary-content'
    });

    this.$answerAnnouncer = $('<div>', {
      'class': 'hidden-but-read',
      'aria-live': 'assertive',
      appendTo: this.$myDom,
    });

    if (that.summaries === undefined || that.summaries.length === 0) {
      return;
    }

    // Create array objects
    for (var panelIndex = 0; panelIndex < that.summaries.length; panelIndex++) {
      if (!(that.summaries[panelIndex].summary && that.summaries[panelIndex].summary.length)) {
        continue;
      }

      elements[panelIndex] = {
        tip: that.summaries[panelIndex].tip,
        summaries: []
      };

      for (var summaryIndex = 0; summaryIndex < that.summaries[panelIndex].summary.length; summaryIndex++) {
        var isAnswer = (summaryIndex === 0);
        that.answer[id] = isAnswer; // First claim is correct

        // create mapping from data-bit to index in panel
        that.dataBitMap[panelIndex] = this.dataBitMap[panelIndex] || [];
        that.dataBitMap[panelIndex][id] = summaryIndex;

        // checks the answer and updates the user response array
        if(that.answers[panelIndex] && (that.answers[panelIndex].indexOf(id) !== -1)){
          this.storeUserResponse(panelIndex, summaryIndex);
        }

        // adds to elements
        elements[panelIndex].summaries[summaryIndex] = {
          id: id++,
          text: that.summaries[panelIndex].summary[summaryIndex]
        };
      }

      // if we have progressed passed this point, the success pattern must also be saved
      if(panelIndex < that.progress){
        this.storeUserResponse(panelIndex, 0);
      }

      // Randomize elements
      for (var k = elements[panelIndex].summaries.length - 1; k > 0; k--) {
        var j = Math.floor(Math.random() * (k + 1));
        var temp = elements[panelIndex].summaries[k];
        elements[panelIndex].summaries[k] = elements[panelIndex].summaries[j];
        elements[panelIndex].summaries[j] = temp;
      }
    }

    // Create content panels
    var $summary_container = $('<div class="summary-container"></div>');
    var $summary_list = $('<ul role="list" aria-labelledby="answerListHeading-'+that.summaryId+'"></ul>');
    var $evaluation = $('<div class="summary-evaluation"></div>');
    var $evaluation_content = $('<div id="questionDesc-'+that.summaryId+'" class="summary-evaluation-content">' + that.options.intro + '</div>');
    var $score = $('<div class="summary-score" role="status"></div>');
    var $options = $('<div class="summary-options"></div>');
    var $progress = $('<div class="summary-progress" aria-live="polite" role="status"></div>');
    var $progressNumeric = $('<div class="summary-progress-numeric" aria-hidden="true"></div>');
    var options_padding = parseInt($options.css('paddingLeft'));
    // content div added for readspeaker that indicates list of correct answers.
    var $answersListHeading = $('<div id="answerListHeading-'+that.summaryId+'" class="h5p-hidden-read">' + that.options.labelCorrectAnswers + '</div>');

    $score
      .html(that.options.scoreLabel + ' ' + this.score)
      .toggleClass('visible', this.score > 0);

    // Insert content
    // aria-hidden = true added for readspeaker to avoid reading empty answers list.
    $summary_container.attr("aria-hidden", "true");
    $summary_container.html($answersListHeading);
    $summary_container.append($summary_list);
    this.$myDom.append($summary_container);
    this.$myDom.append($evaluation);
    this.$myDom.append($options);
    $evaluation.append($evaluation_content);
    $evaluation.append($evaluation);
    $evaluation.append($progress);
    $evaluation.append($progressNumeric);
    $evaluation.append($score);

    /**
     * Handle selected alternative
     *
     * @param {jQuery} $el Selected element
     * @param {boolean} [setFocus] Set focus on first element of next panel.
     *  Used when alt was selected with keyboard.
     */
    var selectedAlt = function ($el, setFocus) {
      var nodeId = Number($el.attr('data-bit'));
      var panelId = Number($el.parent().data('panel'));
      var isRadioClicked = $el.attr('aria-checked');
      if(isRadioClicked == 'true') return;

      if (that.errorCounts[panelId] === undefined) {
        that.errorCounts[panelId] = 0;
      }

      that.storeUserResponse(panelId, nodeId);

      // Correct answer?
      if (that.answer[nodeId]) {
        that.announceAnswer(true);
        that.stopStopWatch(panelId);

        that.progress++;
        var position = $el.position();
        var summary = $summary_list.position();
        var $answer = $('<li role="listitem">' + $el.html() + '</li>');

        $progressNumeric.html(that.options.solvedLabel + ' '  + (panelId + 1) + '/' + that.summaries.length);

        var interpolatedProgressText = that.options.progressText
          .replace(':num', panelId + 1)
          .replace(':total', that.summaries.length);
        $progress.html(interpolatedProgressText);

        $el.attr("aria-checked", "true");

        // Insert correct claim into summary list
        $summary_list.append($answer);
        $summary_container.addClass('has-results');
        // change aria-hidden property as when correct answer is added inside list at top
        $summary_container.attr("aria-hidden", "false");
        that.adjustTargetHeight($summary_container, $summary_list, $answer);


        // Move into position over clicked element
        $answer.css({display: 'block', width: $el.css('width'), height: $el.css('height')});
        $answer.css({position: 'absolute', top: position.top, left: position.left});
        $answer.css({backgroundColor: '#9dd8bb', border: ''});
        setTimeout(function () {
          $answer.css({backgroundColor: ''});
        }, 1);
        //$answer.animate({backgroundColor: '#eee'}, 'slow');

        var panel = parseInt($el.parent().attr('data-panel'));
        var $curr_panel = $('.h5p-panel:eq(' + panel + ')', that.$myDom);
        var $next_panel = $('.h5p-panel:eq(' + (panel + 1) + ')', that.$myDom);
        var finished = ($next_panel.length === 0);
        // Disable panel while waiting for animation
        $curr_panel.addClass('panel-disabled');

        // Update tip:
        $evaluation_content.find('.joubel-tip-container').remove();
        if (elements[that.progress] !== undefined &&
          elements[that.progress].tip !== undefined &&
          elements[that.progress].tip.trim().length > 0) {
          $evaluation_content.append(H5P.JoubelUI.createTip(elements[that.progress].tip, {
            tipLabel: that.options.tipButtonLabel
          }));
        }

        $answer.animate(
          {
            top: summary.top + that.offset,
            left: '-=' + options_padding + 'px',
            width: '+=' + (options_padding * 2) + 'px'
          },
          {
            complete: function() {
              // Remove position (becomes inline);
              $(this).css('position', '').css({
                width: '',
                height: '',
                top: '',
                left: ''
              });
              $summary_container.css('height', '');

              // Calculate offset for next summary item
              var tpadding = parseInt($answer.css('paddingTop')) * 2;
              var tmargin = parseInt($answer.css('marginBottom'));
              var theight = parseInt($answer.css('height'));
              that.offset += theight + tpadding + tmargin + 1;

              // Fade out current panel
              $curr_panel.fadeOut('fast', function () {
                $curr_panel.parent().css('height', 'auto');
                // Show next panel if present
                if (!finished) {
                  // start next timer
                  that.startStopWatch(that.progress);

                  $next_panel.fadeIn('fast');

                  // Focus first element of next panel
                  if (setFocus) {
                    $next_panel.children().get(0).focus();
                  }
                } else {
                  // Hide intermediate evaluation
                  $evaluation_content.html(that.options.resultLabel);

                  that.doFinalEvaluation();
                }
                that.trigger('resize');
              });
            }
          }
        );
      }
      else {
        that.announceAnswer(false);
        // Remove event handler (prevent repeated clicks) and mouseover effect
        $el.off('click');
        $el.addClass('summary-failed');
        const label = that.options.alternativeIncorrectLabel + '. '
          + $el.text();
        $el.attr('aria-label', label);
        $el.removeClass('summary-claim-unclicked');
        $el.attr("aria-checked", "true");
        $evaluation.children('.summary-score').toggleClass('visible', true);
        $score.html(that.options.scoreLabel + ' ' + (++that.score));
        that.errorCounts[panelId]++;
        if (that.answers[panelId] === undefined) {
          that.answers[panelId] = [];
        }
        that.answers[panelId].push(nodeId);
      }

      that.trigger('resize');
      that.triggerXAPI('interacted');

      // Trigger answered xAPI event on first try for the current
      // statement group
      if (that.userResponses[panelId].length === 1) {
        that.trigger(that.createXApiAnsweredEvent(
          that.summaries[panelId],
          that.userResponses[panelId] || [],
          panelId,
          that.timePassedInStopWatch(panelId)));
      }

      // Trigger overall answered xAPI event when finished
      if (finished) {
        that.triggerXAPIScored(that.getScore(), that.getMaxScore(), 'answered');
      }
    };

    // Initialize the visible and invisible progress counters
    $progressNumeric.html(that.options.solvedLabel + ' ' + this.progress + '/' + that.summaries.length);
    var interpolatedProgressText = that.options.progressText
      .replace(':num', that.progress)
      .replace(':total', that.summaries.length);
    $progress.html(interpolatedProgressText);

    // Add elements to content
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];

      if (i < that.progress) { // i is panelId
        for (var j = 0; j < element.summaries.length; j++) {
          var sum = element.summaries[j];
          if (that.answer[sum.id]) {
            $summary_list.append('<li style="display:block">' + sum.text + '</li>');
            $summary_container.addClass('has-results');
            break;
          }
        }
        // Cannot use continue; due to id/animation system
      }

      // added aria-labelledby property for readspeaker to read, when first option receive focus
      var $page = $('<ul aria-labelledby="questionDesc-'+that.summaryId+'" role="radiogroup" class="h5p-panel" data-panel="' + i + '"></ul>');


      // Create initial tip for first summary-list if tip is available
      if (i==0 && element.tip !== undefined && element.tip.trim().length > 0) {
        $evaluation_content.append(H5P.JoubelUI.createTip(element.tip, {
          tipLabel: that.options.tipButtonLabel
        }));
      }

      for (var j = 0; j < element.summaries.length; j++) {
        var summaryLineClass = 'summary-claim-unclicked';

        // If progress is at current task
        if (that.progress === i && that.answers[that.progress]) {
          // Check if there are any previous wrong answers.
          for (var k = 0; k < that.answers[that.progress].length; k++) {
            if (that.answers[that.progress][k] === element.summaries[j].id) {
              summaryLineClass = 'summary-failed';
              break;
            }
          }
        }

        var $node = $('' +
          '<li role="radio" aria-checked="false" data-name="'+j+'" data-bit="' + element.summaries[j].id + '" class="' + summaryLineClass + '">' +
            element.summaries[j].text +
          '</li>');
        // added tabindex = 0 for the first option to avoid accessing rest of the options via TAB
        (j == 0) ? $node.attr("tabindex", "0") : $node.attr("tabindex", "-1");

        $node.on('focus', function() {
          var ind = $(this).attr('data-name');
          setFocusIndex(ind);
        });

        // function captures the index of currently focused option
        var setFocusIndex = function(idx) {
          currentFocusedOption = idx;
        };

        // Do not add click event for failed nodes
        if (summaryLineClass === 'summary-failed') {
          $page.append($node);
          continue;
        }

        $node.click(function() {
          selectedAlt($(this));
        }).keydown(function (e) {
          switch (e.which) {
            case 13: // Enter
            case 32: // Space
              selectedAlt($(this), true);
              e.preventDefault();
              break;

            case 37: // Left Arrow
            case 38: // Up Arrow
              // Go to previous Option
              that.gotoPreviousOption(that, currentFocusedOption);
              e.preventDefault();
              break;

            case 39: // Right Arrow
            case 40: // Down Arrow
              // Go to next Option
              that.gotoNextOption(that, currentFocusedOption);
              e.preventDefault();
              break;
          }
        });

        $page.append($node);
      }

      $options.append($page);
    }

    if (that.progress === elements.length) {
      $evaluation_content.html(that.options.resultLabel);
      that.doFinalEvaluation();
    }
    else {
      // Show first panel
      $('.h5p-panel:eq(' + (that.progress) + ')', that.$myDom).css({display: 'block'});
      if (that.progress) {
        that.offset = ($('.summary-claim-unclicked:visible:first', that.$myDom).outerHeight() * that.errorCounts.length);
      }
    }

    that.trigger('resize');

    return this.$myDom;
  };

  /**
   * Announce if answered alternative was correct or wrong
   * @param isCorrect
   */
  Summary.prototype.announceAnswer = function (isCorrect) {
    const announcement = isCorrect
      ? this.options.labelCorrect
      : this.options.labelIncorrect;
    this.$answerAnnouncer.html(announcement);

    // Remove text so it can't be navigated to and read at a later point
    setTimeout(function () {
      this.$answerAnnouncer.html('');
    }.bind(this), 100);
  };

  /**
   * Returns true if answers have been given
   *
   * @return {boolean}
   */
  Summary.prototype.getAnswerGiven = function () {
    return this.errorCounts.length > 0;
  };

  /**
   * Handles moving the focus from the current option to the previous option and changes tabindex accorindgly
   *
   */
  Summary.prototype.gotoPreviousOption = function (that, currentFocusedOption) {
    this.currentFocusedOption = currentFocusedOption;
    var totOptions = that.summaries[that.progress].summary.length;
    var prevRadioEle = $("ul[data-panel="+that.progress+"] li[role='radio']", this.$myDom);

    //prevRadioEle.removeAttr("tabindex");
    prevRadioEle.attr("tabindex", "-1");
    this.currentFocusedOption--;

    if(this.currentFocusedOption < 0) {
        var num = totOptions - 1;
        prevRadioEle.eq(num).attr("tabindex", "0");
        prevRadioEle.eq(num).focus();
      }
      else {
        prevRadioEle.eq(this.currentFocusedOption).attr("tabindex", "0");
        prevRadioEle.eq(this.currentFocusedOption).focus();
      }
    };

  /**
   * Handles moving the focus from the current option to the next option and changes tabindex accorindgly
   *
   */
  Summary.prototype.gotoNextOption = function (that, currentFocusedOption) {
    this.currentFocusedOption = currentFocusedOption;
    var totOptions = that.summaries[that.progress].summary.length;
    var nextRadioEle = $("ul[data-panel="+that.progress+"] li[role='radio']", this.$myDom);

    //nextRadioEle.removeAttr("tabindex");
    nextRadioEle.attr("tabindex", "-1");
    this.currentFocusedOption++;

    if(this.currentFocusedOption == totOptions) {
      nextRadioEle.eq(0).attr("tabindex", "0");
      nextRadioEle.eq(0).focus();
    }
    else {
      nextRadioEle.eq(this.currentFocusedOption).attr("tabindex", "0");
      nextRadioEle.eq(this.currentFocusedOption).focus();
    }
  };

  /**
   * Calculate final score and display feedback.
   *
   * @param container
   * @param options_panel
   * @param list
   * @param score
   */
  Summary.prototype.doFinalEvaluation = function () {
    var that = this;
    var errorCount = this.countErrors();
    var maxScore = that.summaries.length;
    var score = maxScore - errorCount;

    // Calculate percentage
    var percent = 100 - (errorCount / that.errorCounts.length * 100);

    // Show final evaluation
    var summary = H5P.Question.determineOverallFeedback(that.options.overallFeedback, percent / 100)
      .replace('@score', score)
      .replace('@total', maxScore)
      .replace('@percent', Math.round(percent));

    $(".summary-evaluation-content", this.$myDom).removeAttr("tabindex");

    var scoreBarLabel = that.options.scoreBarLabel.replace(':num', score).replace(':total', maxScore);

    this.setFeedback(summary, score, maxScore, scoreBarLabel);

    // Only read out the score after the progress is read
    setTimeout(function() {
      that.setBehaviour({disableReadSpeaker: false});
      that.readFeedback();
      that.read(scoreBarLabel);
    }, 3000);

    that.trigger('resize');
  };

  /**
   * Resets the complete task back to its' initial state.
   * Used for contracts.
   */
  Summary.prototype.resetTask = function () {
    this.offset = 0;
    this.score = 0;
    this.progress = 0;
    this.answers = [];
    this.answer = [];
    this.errorCounts = [];
    this.userResponses = [];
    this.dataBitMap = [];

    if (this.$myDom) {
      const contentWrapper = this.$myDom[0].parentNode;
      contentWrapper.innerHTML = '';
      this.createQuestion();
      contentWrapper.appendChild(this.$myDom[0]);
      this.removeFeedback();
    }
  };

  /**
   * Adjust height of container.
   *
   * @param container
   * @param elements
   * @param el
   */
  Summary.prototype.adjustTargetHeight = function (container, elements, el) {
    var new_height = parseInt(elements.outerHeight()) + parseInt(el.outerHeight()) + parseInt(el.css('marginBottom')) + parseInt(el.css('marginTop'));
    if (new_height > parseInt(container.css('height'))) {
      container.animate({height: new_height});
    }
  };

  /**
   * Count amount of wrong answers
   *
   * @returns {number}
   */
  Summary.prototype.countErrors = function() {
    var error_count = 0;

    // Count boards without errors
    for (var i = 0; i < this.summaries.length; i++) {
      if (this.errorCounts[i] === undefined) {
        error_count++;
      }
      else {
        error_count += this.errorCounts[i] ? 1 : 0;
      }
    }

    return error_count;
  };

  /**
   * Returns the choices array for xApi statements
   *
   * @param {String[]} answers
   *
   * @return {{ choices: []}}
   */
  Summary.prototype.getXApiChoices = function (answers) {
    var choices = answers.map(function(answer, index){
      return XApiEventBuilder.createChoice(index.toString(), answer);
    });

    return {
      choices: choices
    };
  };

  /**
   * Saves the user response
   *
   * @param {number} questionIndex
   * @param {number} answerIndex
   */
  Summary.prototype.storeUserResponse = function (questionIndex, answerIndex) {
    var self = this;
    if(self.userResponses[questionIndex] === undefined){
      self.userResponses[questionIndex] = [];
    }

    self.userResponses[questionIndex].push(this.dataBitMap[questionIndex][answerIndex]);
  };

  /**
   * Starts a stopwatch for indexed slide
   *
   * @param {number} index
   */
  Summary.prototype.startStopWatch = function (index) {
    this.stopWatches[index] = this.stopWatches[index] || new StopWatch();
    this.stopWatches[index].start();
  };

  /**
   * Stops a stopwatch for indexed slide
   *
   * @param {number} [index]
   */
  Summary.prototype.stopStopWatch = function (index) {
    if(this.stopWatches[index]){
      this.stopWatches[index].stop();
    }
  };

  /**
   * Returns the passed time in seconds of a stopwatch on an indexed slide,
   * or 0 if not existing
   *
   * @param {number} index
   * @return {number}
   */
  Summary.prototype.timePassedInStopWatch = function (index) {
    if(this.stopWatches[index] !== undefined){
      return this.stopWatches[index].passedTime();
    }
    else {
      // if not created, return no passed time,
      return 0;
    }
  };

  /**
   * Returns the time the user has spent on all questions so far
   *
   * @return {number}
   */
  Summary.prototype.getTotalPassedTime = function () {
    return this.stopWatches
      .filter(function(watch){
        return watch !== undefined;
      })
      .reduce(function(sum, watch){
        return sum + watch.passedTime();
      }, 0);
  };

  /**
   * Creates an xAPI answered event for a single statement list
   *
   * @param {object} panel
   * @param {number[]} userAnswer
   * @param {number} panelIndex
   * @param {number} duration
   *
   * @return {H5P.XAPIEvent}
   */
  Summary.prototype.createXApiAnsweredEvent = function (panel, userAnswer, panelIndex, duration) {
    var self = this;

    // creates the definition object
    var definition = XApiEventBuilder.createDefinition()
      .name('Summary statement')
      .description(self.options.intro)
      .interactionType(XApiEventBuilder.interactionTypes.CHOICE)
      .correctResponsesPattern(['0'])
      .optional(self.getXApiChoices(panel.summary))
      .build();

    // create the result object
    var result = XApiEventBuilder.createResult()
      .response(userAnswer.join('[,]'))
      .duration(duration)
      .score((self.correctOnFirstTry(userAnswer) ? 1 : 0), 1)
      .build();

    return XApiEventBuilder.create()
      .verb(XApiEventBuilder.verbs.ANSWERED)
      .objectDefinition(definition)
      .context(self.contentId, self.subContentId)
      .contentId(self.contentId, panel.subContentId)
      .result(result)
      .build();
  };

  Summary.prototype.correctOnFirstTry = function(userAnswer){
    return (userAnswer.length === 1) && userAnswer[0] === 0;
  };

  /**
   * Retrieves the xAPI data necessary for generating result reports.
   *
   * @return {object}
   */
  Summary.prototype.getXAPIData = function(){
    var self = this;

    // create array with userAnswer
    var children = self.summaries.map(function(panel, index) {
        var userResponse = self.userResponses[index] || [];
        var duration = self.timePassedInStopWatch(index);
        var event = self.createXApiAnsweredEvent(panel, userResponse, index, duration);

        return {
          statement: event.data.statement
        };
    });

    var result = XApiEventBuilder.createResult()
      .score(self.getScore(), self.getMaxScore())
      .duration(self.getTotalPassedTime())
      .build();

    // creates the definition object
    var definition = XApiEventBuilder.createDefinition()
      .interactionType(XApiEventBuilder.interactionTypes.COMPOUND)
      .name(self.getTitle())
      .description(self.options.intro)
      .build();

    var xAPIEvent = XApiEventBuilder.create()
      .verb(XApiEventBuilder.verbs.ANSWERED)
      .contentId(self.contentId, self.subContentId)
      .context(self.getParentAttribute('contentId'), self.getParentAttribute('subContentId'))
      .objectDefinition(definition)
      .result(result)
      .build();

    return {
      statement: xAPIEvent.data.statement,
      children: children
    };
  };

  /**
   * Returns an attribute from this.parent if it exists
   *
   * @param {string} attributeName
   * @return {*|undefined}
   */
  Summary.prototype.getParentAttribute = function (attributeName) {
    var self = this;

    if(self.parent !== undefined){
      return self.parent[attributeName];
    }
  };

  return Summary;

})(H5P.jQuery, H5P.Question, H5P.Summary.XApiEventBuilder, H5P.Summary.StopWatch);
