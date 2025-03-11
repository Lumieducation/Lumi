var H5P = H5P || {};

/**
 * TODO: This content type needs refactoring. Badly!
 */
H5P.Essay = function ($, Question) {
  'use strict';

  // CSS Classes
  const SOLUTION_CONTAINER = 'h5p-essay-solution-container';
  const SOLUTION_TITLE = 'h5p-essay-solution-title';
  const SOLUTION_INTRODUCTION = 'h5p-essay-solution-introduction';
  const SOLUTION_SAMPLE = 'h5p-essay-solution-sample';
  const SOLUTION_SAMPLE_TEXT = 'h5p-essay-solution-sample-text';

  // The H5P feedback right now only expects true (green)/false (red) feedback, not neutral feedback
  const FEEDBACK_EMPTY = '<span class="h5p-essay-feedback-empty">...</span>';

  /**
   * @constructor
   * @param {Object} config - Config from semantics.json.
   * @param {string} contentId - ContentId.
   * @param {Object} [contentData] - contentData.
   */
  function Essay(config, contentId, contentData) {
    // Initialize
    if (!config) {
      return;
    }

    // Inheritance
    Question.call(this, 'essay');

    // Sanitize defaults
    this.params = Essay.extend(
      {
        media: {},
        taskDescription: '',
        solution: {},
        keywords: [],
        overallFeedback: [],
        behaviour: {
          minimumLength: 0,
          inputFieldSize: 10,
          enableCheckButton: true,
          enableRetry: true,
          enableSolutionsButton: true,
          ignoreScoring: false,
          pointsHost: 1,
          linebreakReplacement: ' '
        },
        checkAnswer: 'Check',
        submitAnswer: 'Submit',
        tryAgain: 'Retry',
        showSolution: 'Show solution',
        feedbackHeader: 'Feedback',
        solutionTitle: 'Sample solution',
        remainingChars: 'Remaining characters: @chars',
        notEnoughChars: 'You must enter at least @chars characters!',
        messageSave: 'saved',
        ariaYourResult: 'You got @score out of @total points',
        ariaNavigatedToSolution: 'Navigated to newly included sample solution after textarea.',
        ariaCheck: 'Check the answers.',
        ariaShowSolution: 'Show the solution. You will be provided with a sample solution.',
        ariaRetry: 'Retry the task. You can improve your previous answer if the author allowed that.'
      },
      config);
    this.contentId = contentId;
    this.extras = contentData;

    const defaultLanguage = (this.extras && this.extras.metadata) ? this.extras.metadata.defaultLanguage || 'en' : 'en';
    this.languageTag = Essay.formatLanguageCode(defaultLanguage);

    this.score = 0;
    this.internalShowSolutionsCall = false;

    // Sanitize HTML encoding
    this.params.placeholderText = this.htmlDecode(this.params.placeholderText || '');

    // Get previous state from content data
    if (typeof contentData !== 'undefined' && typeof contentData.previousState !== 'undefined' && contentData.previousState !== null) {
      this.previousState = contentData.previousState;
    }

    this.isAnswered = this.previousState && this.previousState.inputField && this.previousState.inputField !== '' || false;
    /*
     * this.params.behaviour.enableSolutionsButton and this.params.behaviour.enableRetry are used by
     * contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-8} and
     * {@link https://h5p.org/documentation/developers/contracts#guides-header-9}
     */
    this.params.behaviour.enableSolutionsButton =
      this.params.behaviour.enableSolutionsButton &&
      (
        typeof this.params.solution.sample !== 'undefined' &&
        this.params.solution.sample !== ''
      );
    this.params.behaviour.enableRetry = this.params.behaviour.enableRetry || false;

    // Determine the minimum number of characters that should be entered
    this.params.behaviour.minimumLength = this.params.behaviour.minimumLength || 0;
    if (this.params.behaviour.maximumLength !== undefined) {
      this.params.behaviour.minimumLength = Math.min(this.params.behaviour.minimumLength, this.params.behaviour.maximumLength);
    }

    // map function
    const toPoints = function (keyword) {
      return (keyword.keyword && keyword.options && keyword.options.points || 0) * (keyword.options.occurrences || 1);
    };

    // reduce function
    const sum = function (a, b) {
      return a + b;
    };

    // scoreMax = Maximum number of points available by all keyword groups
    const scoreMax = this.params.keywords
      .map(toPoints)
      .reduce(sum, 0);

    // scoreMastering: score indicating mastery and maximum number on progress bar (can be < scoreMax)
    this.scoreMastering = this.params.behaviour.percentageMastering === undefined ?
      scoreMax :
      this.params.behaviour.percentageMastering * scoreMax / 100;

    // scorePassing: score to pass the task (<= scoreMastering)
    this.scorePassing = Math.min(
      this.getMaxScore(),
      this.params.behaviour.percentagePassing * scoreMax / 100 || 0);

    this.solution = this.buildSolution();

    // Re-create score
    if (typeof this.previousState === 'object' && Object.keys(this.previousState).length) {
      this.updateScore();
    }
  }

  // Extends Question
  Essay.prototype = Object.create(Question.prototype);
  Essay.prototype.constructor = Essay;

  /**
   * Register the DOM elements with H5P.Question.
   */
  Essay.prototype.registerDomElements = function () {
    const that = this;

    // Set optional media
    const media = (this.params.media) ? this.params.media.type : undefined;
    if (media && media.library) {
      const type = media.library.split(' ')[0];
      if (type === 'H5P.Image') {
        if (media.params.file) {
          this.setImage(media.params.file.path, {
            disableImageZooming: this.params.media.disableImageZooming,
            alt: media.params.alt,
            title: media.params.title,
            expandImage: media.params.expandImage,
            minimizeImage: media.params.minimizeImage
          });
        }
      }
      else if (type === 'H5P.Video') {
        if (media.params.sources) {
          this.setVideo(media);
        }
      }
      else if (type === 'H5P.Audio') {
        if (media.params.files) {
          this.setAudio(media);
        }
      }
    }

    // Check whether status bar is needed, no "saved" message when subcontent
    const statusBar = !!(
      this.params.behaviour.minimumLength ||
      this.params.behaviour.maximumLength ||
      (H5PIntegration && H5PIntegration.saveFreq && this.isRoot())
    );

    // Create InputField
    this.inputField = new H5P.Essay.InputField({
      taskDescription: this.params.taskDescription,
      placeholderText: this.params.placeholderText,
      maximumLength: this.params.behaviour.maximumLength,
      remainingChars: this.params.remainingChars,
      inputFieldSize: this.params.behaviour.inputFieldSize,
      previousState: this.previousState,
      statusBar: statusBar
    }, {
      onInteracted: (function (params) {
        that.handleInteracted(params);
      }),
      onInput: (function () {
        that.handleInput();
      })
    });

    this.setViewState(this.previousState && this.previousState.viewState || 'task');
    if (this.viewState === 'results') {
      // Need to wait until DOM is ready for us
      H5P.externalDispatcher.on('initialized', function () {
        that.handleCheckAnswer({ skipXAPI: true });
      });
    }
    else if (this.viewState === 'solutions') {
      // Need to wait until DOM is ready for us
      H5P.externalDispatcher.on('initialized', function () {
        that.handleCheckAnswer({ skipXAPI: true });
        that.showSolutions();
        // We need the retry button if the mastering score has not been reached or scoring is irrelevant
        if (that.getScore() < that.getMaxScore() || that.params.behaviour.ignoreScoring || that.getMaxScore() === 0) {
          if (that.params.behaviour.enableRetry) {
            that.showButton('try-again');
          }
        }
        else {
          that.hideButton('try-again');
        }
      });
    }

    // Register task introduction text
    this.setIntroduction(this.inputField.getIntroduction());

    // Register content
    this.content = this.inputField.getContent();
    this.setContent(this.content);

    // Register Buttons
    this.addButtons();
  };

  /**
   * Add all the buttons that shall be passed to H5P.Question.
   */
  Essay.prototype.addButtons = function () {
    const that = this;

    // Show solution button
    that.addButton('show-solution', that.params.showSolution, function () {
      // Not using a parameter for showSolutions to not mess with possibe future contract changes
      that.internalShowSolutionsCall = true;
      that.showSolutions();
      that.internalShowSolutionsCall = false;
    }, false, {
      'aria-label': this.params.ariaShowSolution
    }, {});

    // Check answer button
    that.addButton('check-answer', that.params.checkAnswer, function () {
      that.handleCheckAnswer();
    }, this.params.behaviour.enableCheckButton, {
      'aria-label': this.params.ariaCheck
    }, {
      contentData: this.extras,
      textIfSubmitting: this.params.submitAnswer,
    });

    // Retry button
    that.addButton('try-again', that.params.tryAgain, function () {
      that.resetTask({ skipClear: true });
    }, false, {
      'aria-label': this.params.ariaRetry
    }, {});
  };

  /**
   * Handle the evaluation.
   * @param {object} [params = {}] Parameters.
   * @param {boolean} [params.skipXAPI = false] If true, don't trigger xAPI.
   */
  Essay.prototype.handleCheckAnswer = function (params) {
    const that = this;

    params = Essay.extend({
      skipXAPI: false
    }, params);

    // Show message if the minimum number of characters has not been met
    if (that.inputField.getText().length < that.params.behaviour.minimumLength) {
      const message = that.params.notEnoughChars.replace(/@chars/g, that.params.behaviour.minimumLength);
      that.inputField.setMessageChars(message, true);
      that.read(message);
      return;
    }

    that.setViewState('results');

    that.inputField.disable();
    /*
     * Only set true on "check". Result computation may take some time if
     * there are many keywords due to the fuzzy match checking, so it's not
     * a good idea to do this while typing.
     */
    that.isAnswered = true;
    that.handleEvaluation(params);

    if (that.params.behaviour.enableSolutionsButton === true) {
      that.showButton('show-solution');
    }
    that.hideButton('check-answer');
  };

  /**
   * Get the user input from DOM.
   * @param {string} [linebreakReplacement=' '] Replacement for line breaks.
   * @return {string} Cleaned input.
   */
  Essay.prototype.getInput = function (linebreakReplacement) {
    linebreakReplacement = linebreakReplacement || ' ';

    let userText = '';
    if (this.inputField) {
      userText = this.inputField.getText();
    }
    else if (this.previousState && this.previousState.inputField) {
      userText = this.previousState.inputField;
    }

    return userText
      .replace(/(\r\n|\r|\n)/g, linebreakReplacement)
      .replace(/\s\s/g, ' ');
  };

  /**
   * Handle user interacted.
   * @param {object} params Parameters.
   * @param {boolean} [params.updateScore] If true, will trigger score computation.
   */
  Essay.prototype.handleInteracted = function (params) {
    params = params || {};

    // Deliberately keeping the state once answered
    this.isAnswered = this.isAnswered || this.inputField.getText().length > 0;
    if (params.updateScore) {
      // Only triggered when explicitly requested due to potential complexity
      this.updateScore();
    }

    this.triggerXAPI('interacted');
  };

  /**
   * Check if Essay has been submitted/minimum length met.
   * @return {boolean} True, if answer was given.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-1}
   */
  Essay.prototype.getAnswerGiven = function () {
    return this.isAnswered;
  };

  /**
   * Get latest score.
   * @return {number} latest score.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-2}
   */
  Essay.prototype.getScore = function () {
    // Return value is rounded because reporting module for moodle's H5P plugin expects integers
    return (this.params.behaviour.ignoreScoring) ?
      this.getMaxScore() :
      this.score;
  };

  /**
   * Get maximum possible score.
   * @return {number} Score necessary for mastering.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-3}
   */
  Essay.prototype.getMaxScore = function () {
    // Return value is rounded because reporting module for moodle's H5P plugin expects integers
    return (this.params.behaviour.ignoreScoring) ?
      this.params.behaviour.pointsHost || 1 : // moodle requires 1 for task completion
      Math.max(1, this.scoreMastering);
  };

  /**
   * Show solution.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-4}
   */
  Essay.prototype.showSolutions = function () {
    this.setViewState('solutions');

    this.inputField.disable();

    if (typeof this.params.solution.sample !== 'undefined' && this.params.solution.sample !== '') {
      // We add the sample solution here to make cheating at least a little more difficult
      if (this.solution.getElementsByClassName(SOLUTION_SAMPLE)[0].children.length === 0) {
        const text = document.createElement('div');
        text.classList.add(SOLUTION_SAMPLE_TEXT);
        text.innerHTML = this.params.solution.sample;
        this.solution.getElementsByClassName(SOLUTION_SAMPLE)[0].appendChild(text);
      }

      // Insert solution after explanations or content.
      const predecessor = this.content.parentNode;

      predecessor.parentNode.insertBefore(this.solution, predecessor.nextSibling);

      // Useful for accessibility, but seems to jump to wrong position on some Safari versions
      this.solutionAnnouncer.focus();
    }

    this.hideButton('show-solution');

    // Handle calls from the outside
    if (!this.internalShowSolutionsCall) {
      this.hideButton('check-answer');
      this.hideButton('try-again');
    }

    this.trigger('resize');
  };

  /**
   * Reset task.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-5}
   */
  Essay.prototype.resetTask = function (params) {
    params = params || {};
    this.setViewState('task');

    this.setExplanation();
    this.removeFeedback();
    this.hideSolution();

    this.hideButton('show-solution');
    this.hideButton('try-again');

    // QuestionSet can control check button despite not in Question Type contract
    if (this.params.behaviour.enableCheckButton) {
      this.showButton('check-answer');
    }

    if (!params.skipClear) {
      this.inputField.setText('');
    }
    this.inputField.enable();
    this.inputField.focus();

    this.isAnswered = false;
  };

  /**
   * Get xAPI data.
   * @return {Object} xAPI statement.
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
   */
  Essay.prototype.getXAPIData = function () {
    return {
      statement: this.getXAPIAnswerEvent().data.statement
    };
  };

  /**
   * Determine whether the task has been passed by the user.
   * @return {boolean} True if user passed or task is not scored.
   */
  Essay.prototype.isPassed = function () {
    return (this.params.behaviour.ignoreScoring || this.getScore() >= this.scorePassing);
  };

  /**
   * Update score.
   * @param {object} results Results.
   */
  Essay.prototype.updateScore = function (results) {
    results = results || this.computeResults();
    this.score = Math.min(this.computeScore(results), this.getMaxScore());
  };

  /**
   * Handle the evaluation.
   * @param {object} [params = {}] Parameters.
   * @param {boolean} [params.skipXAPI = false] If true, don't trigger xAPI.
   */
  Essay.prototype.handleEvaluation = function (params) {
    params = Essay.extend({
      skipXAPI: false
    }, params);
    const results = this.computeResults();

    // Build explanations
    const explanations = this.buildExplanation(results);

    // Show explanations
    if (explanations.length > 0) {
      this.setExplanation(explanations, this.params.feedbackHeader);
    }

    // Not all keyword groups might be necessary for mastering
    this.updateScore(results);
    const textScore = H5P.Question
      .determineOverallFeedback(this.params.overallFeedback, this.getScore() / this.getMaxScore())
      .replace('@score', this.getScore())
      .replace('@total', this.getMaxScore());

    if (!this.params.behaviour.ignoreScoring && this.getMaxScore() > 0) {
      const ariaMessage = (this.params.ariaYourResult)
        .replace('@score', ':num')
        .replace('@total', ':total');
      this.setFeedback(textScore, this.getScore(), this.getMaxScore(), ariaMessage);
    }

    // Show and hide buttons as necessary
    this.handleButtons(this.getScore());

    if (!params.skipXAPI) {
      // Trigger xAPI statements as necessary
      this.handleXAPI();
    }

    this.trigger('resize');
  };

  /**
   * Build solution DOM object.
   * @return {Object} DOM object.
   */
  Essay.prototype.buildSolution = function () {
    const solution = document.createElement('div');
    solution.classList.add(SOLUTION_CONTAINER);

    this.solutionAnnouncer = document.createElement('div');
    this.solutionAnnouncer.setAttribute('tabindex', '0');
    this.solutionAnnouncer.setAttribute('aria-label', this.params.ariaNavigatedToSolution);
    this.solutionAnnouncer.addEventListener('focus', function (event) {
      // Just temporary tabbable element. Will be announced by readspaker.
      event.target.blur();
      event.target.setAttribute('tabindex', '-1');
    });
    solution.appendChild(this.solutionAnnouncer);

    const solutionTitle = document.createElement('div');
    solutionTitle.classList.add(SOLUTION_TITLE);
    solutionTitle.innerHTML = this.params.solutionTitle;
    solution.appendChild(solutionTitle);

    const solutionIntroduction = document.createElement('div');
    solutionIntroduction.classList.add(SOLUTION_INTRODUCTION);
    solutionIntroduction.innerHTML = this.params.solution.introduction;
    solution.appendChild(solutionIntroduction);

    const solutionSample = document.createElement('div');
    solutionSample.classList.add(SOLUTION_SAMPLE);
    solution.appendChild(solutionSample);

    return solution;
  };

  /**
   * Hide the solution.
   */
  Essay.prototype.hideSolution = function () {
    if (this.solution.parentNode !== null) {
      this.solution.parentNode.removeChild(this.solution);
    }
  };

  /**
   * Compute results.
   * @return {Object[]} Results: [[{"keyword": keyword, "match": match, "index": index}*]*].
   */
  Essay.prototype.computeResults = function () {
    const that = this;
    const results = [];

    // Should not happen, but just to be sure ...
    this.params.keywords = this.params.keywords || [];

    // Filter out keywords that have not been set.
    this.params.keywords = this.params.keywords.filter(function (element) {
      return typeof element.keyword !== 'undefined';
    });

    this.params.keywords.forEach(function (alternativeGroup) {
      const resultsGroup = [];
      const options = alternativeGroup.options;
      const caseSensitive = (that.params.behaviour.overrideCaseSensitive !== 'off') &&
        (that.params.behaviour.overrideCaseSensitive === 'on' || options.caseSensitive);

      let alternatives = [alternativeGroup.keyword || []]
        .concat(alternativeGroup.alternatives || [])
        .map(function (alternative) {
          return that.htmlDecode(alternative);
        });

      /*
       * Get all matches to regular expressions and pretend the matches were
       * given as alternative answers in order to be able to detect them.
       * This result computation might need a rewrite ...
       */
      const regularExpressionMatches = that
        .getRegExpAlternatives(
          alternatives,
          that.getInput(that.params.behaviour.linebreakReplacement),
          caseSensitive
        )
        .map(function (match) {
          // Allow to differentiate from wildcard asterisk
          return match = match.replace(/\*/, Essay.REGULAR_EXPRESSION_ASTERISK);
        });

      // Not chained, because we still need the old value inside
      alternatives = alternatives
        // only "normal" alternatives
        .filter(function (alternative) {
          return (alternative[0] !== '/' || alternative[alternative.length - 1] !== '/');
        })
        // regular matches found in text for alternatives
        .concat(regularExpressionMatches)
        // regular matches could match empty string
        .filter(function (alternative) {
          return alternative !== '';
        });

      // Detect all matches
      alternatives.forEach(function (alternative) {
        let inputTest = that.getInput(that.params.behaviour.linebreakReplacement);

        if (!caseSensitive) {
          alternative = alternative.toLowerCase();
          inputTest = inputTest.toLowerCase();
        }

        // Build array of matches for each type of match
        const matchesExact = that.detectExactMatches(alternative, inputTest);
        const matchesWildcard = alternative.indexOf('*') !== -1 ? that.detectWildcardMatches(alternative, inputTest, caseSensitive) : [];

        const forgiveMistakes =
          (that.params.behaviour.overrideForgiveMistakes !== 'off') &&
          (
            that.params.behaviour.overrideForgiveMistakes === 'on' ||
            options.forgiveMistakes
          );

        const matchesFuzzy = forgiveMistakes ?
          that.detectFuzzyMatches(alternative, inputTest) :
          [];

        // Merge matches without duplicates
        that.mergeMatches(matchesExact, matchesWildcard, matchesFuzzy).forEach(function (item) {
          resultsGroup.push(item);
        });
      });
      results.push(resultsGroup);
    });
    return results;
  };

  /**
   * Compute the score for the results.
   * @param {Object[]} results - Results from the task.
   * @return {number} Score.
   */
  Essay.prototype.computeScore = function (results) {
    let score = 0;
    this.params.keywords.forEach(function (keyword, i) {
      score += Math.min(results[i].length, keyword.options.occurrences) * keyword.options.points;
    });
    return score;
  };

  /**
   * Build the explanations for H5P.Question.setExplanation.
   * @param {Object} results - Results from the task.
   * @return {Object[]} Explanations for H5P.Question.
   */
  Essay.prototype.buildExplanation = function (results) {
    const explanations = [];

    let word;
    this.params.keywords.forEach(function (keyword, i) {
      word = FEEDBACK_EMPTY;
      // Keyword was not found and feedback is provided for this case
      if (results[i].length === 0 && keyword.options.feedbackMissed) {
        if (keyword.options.feedbackMissedWord === 'keyword') {
          // Main keyword defined
          word = keyword.keyword;
        }
        explanations.push({correct: word, text: keyword.options.feedbackMissed});
      }

      // Keyword found and feedback is provided for this case
      if (results[i].length > 0 && keyword.options.feedbackIncluded) {
        // Set word in front of feedback
        switch (keyword.options.feedbackIncludedWord) {
          case 'keyword':
            // Main keyword defined
            word = keyword.keyword;
            break;
          case 'alternative':
            // Alternative that was found
            word = results[i][0].keyword;
            break;
          case 'answer':
            // Answer matching an alternative at the learner typed it
            word = results[i][0].match;
            break;
        }
        explanations.push({correct: word, text: keyword.options.feedbackIncluded});
      }
    });

    if (explanations.length > 0) {
      // Sort "included" before "not included", but keep order otherwise
      explanations.sort(function (a, b) {
        return a.correct === FEEDBACK_EMPTY && b.correct !== FEEDBACK_EMPTY;
      });
    }
    return explanations;
  };

  /**
   * Handle buttons' visibility.
   * @param {number} score - Score the user received.
   */
  Essay.prototype.handleButtons = function (score) {
    if (this.params.solution.sample && !this.solution) {
      this.showButton('show-solution');
    }

    // We need the retry button if the mastering score has not been reached or scoring is irrelevant
    if (score < this.getMaxScore() || this.params.behaviour.ignoreScoring || this.getMaxScore() === 0) {
      if (this.params.behaviour.enableRetry) {
        this.showButton('try-again');
      }
    }
    else {
      this.hideButton('try-again');
    }
  };

  /**
   * Handle xAPI event triggering
   * @param {number} score - Score the user received.
   */
  Essay.prototype.handleXAPI = function () {
    this.trigger(this.getXAPIAnswerEvent());

    // Additional xAPI verbs that might be useful for making analytics easier
    if (!this.params.behaviour.ignoreScoring && this.getMaxScore() > 0) {
      if (this.getScore() < this.scorePassing) {
        this.trigger(this.createEssayXAPIEvent('failed'));
      }
      else {
        this.trigger(this.createEssayXAPIEvent('passed'));
      }
      if (this.getScore() >= this.getMaxScore()) {
        this.trigger(this.createEssayXAPIEvent('mastered'));
      }
    }
  };

  /**
   * Create an xAPI event for Essay.
   * @param {string} verb - Short id of the verb we want to trigger.
   * @return {H5P.XAPIEvent} Event template.
   */
  Essay.prototype.createEssayXAPIEvent = function (verb) {
    const xAPIEvent = this.createXAPIEventTemplate(verb);
    Essay.extend(
      xAPIEvent.getVerifiedStatementValue(['object', 'definition']),
      this.getxAPIDefinition());
    return xAPIEvent;
  };

  /**
   * Get the xAPI definition for the xAPI object.
   * return {Object} XAPI definition.
   */
  Essay.prototype.getxAPIDefinition = function () {
    const definition = {};
    definition.name = {};
    definition.name[this.languageTag] = this.getTitle();
    // Fallback for h5p-php-reporting, expects en-US
    definition.name['en-US'] = definition.name[this.languageTag];
    // The H5P reporting module expects the "blanks" to be added to the description
    definition.description = {};
    definition.description[this.languageTag] = this.params.taskDescription + Essay.FILL_IN_PLACEHOLDER;
    // Fallback for h5p-php-reporting, expects en-US
    definition.description['en-US'] = definition.description[this.languageTag];
    definition.type = 'http://id.tincanapi.com/activitytype/essay';
    definition.interactionType = 'long-fill-in';
    /*
     * The official xAPI documentation discourages to use a correct response
     * pattern it if the criteria for a question are complex and correct
     * responses cannot be exhaustively listed. They can't.
     */
    return definition;
  };

  /**
   * Build xAPI answer event.
   * @return {H5P.XAPIEvent} xAPI answer event.
   */
  Essay.prototype.getXAPIAnswerEvent = function () {
    const xAPIEvent = this.createEssayXAPIEvent('answered');

    xAPIEvent.setScoredResult(this.getScore(), this.getMaxScore(), this, true, this.isPassed());
    xAPIEvent.data.statement.result.response = this.inputField.getText();

    return xAPIEvent;
  };

  /**
   * Detect exact matches of needle in haystack.
   * @param {string} needle - Word or phrase to find.
   * @param {string} haystack - Text to find the word or phrase in.
   * @return {Object[]} Results: [{'keyword': needle, 'match': needle, 'index': front + pos}*].
   */
  Essay.prototype.detectExactMatches = function (needle, haystack) {
    // Simply detect all exact matches and its positions in the haystack
    const result = [];
    let pos = -1;
    let front = 0;

    needle = needle
      .replace(/\*/, '') // Wildcards checked separately
      .replace(new RegExp(Essay.REGULAR_EXPRESSION_ASTERISK, 'g'), '*'); // Asterisk from regexp

    while (((pos = haystack.indexOf(needle))) !== -1 && needle !== '') {
      if (H5P.TextUtilities.isIsolated(needle, haystack)) {
        result.push({'keyword': needle, 'match': needle, 'index': front + pos});
      }
      front += pos + needle.length;
      haystack = haystack.substr(pos + needle.length);
    }
    return result;
  };

  /**
   * Detect wildcard matches of needle in haystack.
   * @param {string} needle - Word or phrase to find.
   * @param {string} haystack - Text to find the word or phrase in.
   * @param {boolean} caseSensitive - If true, alternative is case sensitive.
   * @return {Object[]} Results: [{'keyword': needle, 'match': needle, 'index': front + pos}*].
   */
  Essay.prototype.detectWildcardMatches = function (needle, haystack, caseSensitive) {
    if (needle.indexOf('*') === -1) {
      return [];
    }

    // Clean needle from successive wildcards
    needle = needle.replace(/[*]{2,}/g, '*');

    // Clean needle from regular expression characters, * needed for wildcard
    const regexpChars = ['\\', '.', '[', ']', '?', '+', '(', ')', '{', '}', '|', '!', '^', '-'];
    regexpChars.forEach(function (char) {
      needle = needle.split(char).join('\\' + char);
    });

    // We accept only characters for the wildcard
    const regexp = new RegExp(needle.replace(/\*/g, Essay.CHARS_WILDCARD + '+'), this.getRegExpModifiers(caseSensitive));
    const result = [];
    let match;
    while ((match = regexp.exec(haystack)) !== null ) {
      if (H5P.TextUtilities.isIsolated(match[0], haystack, {'index': match.index})) {
        result.push({'keyword': needle, 'match': match[0], 'index': match.index});
      }
    }
    return result;
  };

  /**
   * Detect fuzzy matches of needle in haystack.
   * @param {string} needle - Word or phrase to find.
   * @param {string} haystack - Text to find the word or phrase in.
   * @param {Object[]} Results.
   */
  Essay.prototype.detectFuzzyMatches = function (needle, haystack) {
    // Ideally, this should be the maximum number of allowed transformations for the Levenshtein disctance.
    const windowSize = 2;
    /*
     * We cannot simple split words because we're also looking for phrases.
     * If we were just looking for exact matches, we could use something smarter
     * such as the KMP algorithm. Because we're dealing with fuzzy matches, using
     * this intuitive exhaustive approach might be the best way to go.
     */
    const results = [];
    // Without looking at the surroundings we'd miss words that have additional or missing chars
    for (let size = -windowSize; size <= windowSize; size++) {
      for (let pos = 0; pos < haystack.length; pos++) {
        const straw = haystack.substr(pos, needle.length + size);
        if (H5P.TextUtilities.areSimilar(needle, straw) && H5P.TextUtilities.isIsolated(straw, haystack, {'index': pos})) {
          // This will only add the match if it's not a duplicate that we found already in the proximity of pos
          if (!this.contains(results, pos)) {
            results.push({'keyword': needle, 'match': straw, 'index': pos});
          }
        }
      }
    }
    return results;
  };

  /**
   * Get all the matches found to a regular expression alternative.
   * @param {string[]} alternatives - Alternatives.
   * @param {string} inputTest - Original text by student.
   * @param {boolean} caseSensitive - If true, alternative is case sensitive.
   * @return {string[]} Matches by regular expressions.
   */
  Essay.prototype.getRegExpAlternatives = function (alternatives, inputTest, caseSensitive) {
    const that = this;

    return alternatives
      .filter(function (alternative) {
        return (alternative[0] === '/' && alternative[alternative.length - 1] === '/');
      })
      .map(function (alternative) {
        const regNeedle = new RegExp(alternative.slice(1, -1), that.getRegExpModifiers(caseSensitive));
        return inputTest.match(regNeedle);
      })
      .reduce(function (a, b) {
        return a.concat(b);
      }, [])
      .filter(function (item) {
        return item !== null;
      });
  };

  /**
   * Get modifiers for regular expressions.
   * @param {boolean} caseSensitive - If true, alternative is case sensitive.
   * @return {string} Modifiers for regular expressions.
   */
  Essay.prototype.getRegExpModifiers = function (caseSensitive) {
    const modifiers = ['g'];
    if (!caseSensitive) {
      modifiers.push('i');
    }

    return modifiers.join('');
  };

  /**
   * Merge the matches.
   * @param {...Object[]} matches - Detected matches.
   * @return {Object[]} Merged matches.
   */
  Essay.prototype.mergeMatches = function () {
    // Sanitization
    if (arguments.length === 0) {
      return [];
    }
    if (arguments.length === 1) {
      return arguments[0];
    }

    // Add all elements from args[1+] to args[0] if not already there close by.
    const results = (arguments[0] || []).slice();
    for (let i = 1; i < arguments.length; i++) {
      const match2 = arguments[i] || [];
      for (let j = 0; j < match2.length; j++) {
        if (!this.contains(results, match2[j].index)) {
          results.push(match2[j]);
        }
      }
    }
    return results.sort(function (a, b) {
      return a.index > b.index;
    });
  };

  /**
   * Check if an array of detected results contains the same match in the word's proximity.
   * Used to prevent double entries that can be caused by fuzzy matching.
   * @param {Object} results - Preliminary results.
   * @param {string} results.match - Match that was found before at a particular position.
   * @param {number} results.index - Starting position of the match.
   * @param {number} index - Index of solution to be checked for double entry.
   */
  Essay.prototype.contains = function (results, index) {
    return results.some(function (result) {
      return Math.abs(result.index - index) <= result.match.length;
    });
  };

  /**
   * Extend an array just like JQuery's extend.
   * @param {...Object} arguments - Objects to be merged.
   * @return {Object} Merged objects.
   */
  Essay.extend = function () {
    for (let i = 1; i < arguments.length; i++) {
      for (let key in arguments[i]) {
        if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
          if (typeof arguments[0][key] === 'object' &&
              typeof arguments[i][key] === 'object') {
            this.extend(arguments[0][key], arguments[i][key]);
          }
          else {
            arguments[0][key] = arguments[i][key];
          }
        }
      }
    }
    return arguments[0];
  };

  /**
   * Get task title.
   * @return {string} Title.
   */
  Essay.prototype.getTitle = function () {
    let raw;
    if (this.extras.metadata) {
      raw = this.extras.metadata.title;
    }
    raw = raw || Essay.DEFAULT_DESCRIPTION;

    // H5P Core function: createTitle
    return H5P.createTitle(raw);
  };

  /**
   * Format language tag (RFC 5646). Assuming "language-coutry". No validation.
   * Cmp. https://tools.ietf.org/html/rfc5646
   * @param {string} languageTag Language tag.
   * @return {string} Formatted language tag.
   */
  Essay.formatLanguageCode = function (languageCode) {
    if (typeof languageCode !== 'string') {
      return languageCode;
    }

    /*
     * RFC 5646 states that language tags are case insensitive, but
     * recommendations may be followed to improve human interpretation
     */
    const segments = languageCode.split('-');
    segments[0] = segments[0].toLowerCase(); // ISO 639 recommendation
    if (segments.length > 1) {
      segments[1] = segments[1].toUpperCase(); // ISO 3166-1 recommendation
    }
    languageCode = segments.join('-');

    return languageCode;
  };

  /**
   * Retrieve true string from HTML encoded string
   * @param {string} input - Input string.
   * @return {string} Output string.
   */
  Essay.prototype.htmlDecode = function (input) {
    const dparser = new DOMParser().parseFromString(input, 'text/html');
    return dparser.documentElement.textContent;
  };

  /**
   * Get current state for H5P.Question.
   * @return {Object} Current state.
   */
  Essay.prototype.getCurrentState = function () {
    if (!this.inputField) {
      return; // may not be attached to the DOM yet
    }

    // No "saved" message when subcontent, requested by H5P core team
    if (this.isRoot()) {
      this.inputField.updateMessageSaved(this.params.messageSave);
    }

    const inputFieldText = this.inputField.getText();
    /*
     * H5P integrations may (for instance) show a restart button if there is
     * a previous state set, so here not storing the state if no answer has been
     * given by the user and there's no order stored previously - preventing
     * to show up that restart button without the need to.
     */
    if (!inputFieldText) {
      return;
    }
    
    return {
      inputField: inputFieldText,
      viewState: this.viewState
    };
  };

  /**
   * Set view state.
   * @param {string} state View state.
   */
  Essay.prototype.setViewState = function (state) {
    if (Essay.VIEW_STATES.indexOf(state) === -1) {
      return;
    }

    this.viewState = state;
  };

  /** @constant {string}
   * latin special chars: \u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF
   * greek chars: \u0370-\u03FF
   * kyrillic chars: \u0400-\u04FF
   * hiragana + katakana: \u3040-\u30FF
   * common CJK characters: \u4E00-\u62FF\u6300-\u77FF\u7800-\u8CFF\u8D00-\u9FFF
   * thai chars: \u0E00-\u0E7F
   */
  Essay.CHARS_WILDCARD = '[A-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\u0370-\u03FF\u0400-\u04FF\u3040-\u309F\u3040-\u30FF\u4E00-\u62FF\u6300-\u77FF\u7800-\u8CFF\u8D00-\u9FFF\u0E00-\u0E7F]';

  /** @constant {string}
   * Required to be added to xAPI object description for H5P reporting
   */
  Essay.FILL_IN_PLACEHOLDER = '__________';

  /** @constant {string} */
  Essay.DEFAULT_DESCRIPTION = 'Essay';

  /** @constant {string} */
  Essay.REGULAR_EXPRESSION_ASTERISK = ':::H5P-Essay-REGEXP-ASTERISK:::';

  /** @constant {string[]} view state names*/
  Essay.VIEW_STATES = ['task', 'results', 'solutions'];

  return Essay;
}(H5P.jQuery, H5P.Question);
