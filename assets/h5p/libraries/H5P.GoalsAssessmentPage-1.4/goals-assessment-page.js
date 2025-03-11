/*global Mustache*/
var H5P = H5P || {};

/**
 * Goals Assessment Page module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.GoalsAssessmentPage = (function ($, EventDispatcher) {
  "use strict";

  // CSS Classes:
  var MAIN_CONTAINER = 'h5p-goals-assessment-page';

  /**
   * Helper for enabling tabbing
   * @param  {H5P.jQuery} $element
   */
  var enableTab = function ($element) {
    $element.attr('tabindex', 0);
  };

  /**
   * Helper for disabling tabbing
   * @param  {H5P.jQuery} $element
   */
  var disableTab = function ($element) {
    $element.attr('tabindex', -1);
  };

  /**
   * Helper for checking a radio
   * @param  {H5P.jQuery} $element
   */
  var check = function ($element) {
    $element.attr('aria-checked', true);
  };

  /**
   * Helper for unchecking a radio
   * @param  {H5P.jQuery} $element
   */
  var uncheck = function ($element) {
    $element.attr('aria-checked', false);
  };

  /**
   * Helper for making elements with role radio behave as excpected
   * @param  {H5P.jQuery} $element
   */
  var makeRadiosAccessible = function ($alternatives) {
    // Initially, first radio is tabable
    enableTab($alternatives.first());

    // Handle arrow-keys
    $alternatives.on('keydown', function (event) {
      var $current = $(this);
      var $focusOn;
      switch (event.which) {
        case 35: // End button
          // Go to previous Option
          $focusOn = $alternatives.last();
          break;

        case 36: // Home button
          // Go to previous Option
          $focusOn = $alternatives.first();
          break;

        case 37: // Left Arrow
        case 38: // Up Arrow
          // Go to previous Option
          $focusOn = $current.prev();
          if ($focusOn.length === 0) {
            // Wrap around
            $focusOn = $alternatives.last();
          }
          break;

        case 39: // Right Arrow
        case 40: // Down Arrow
          // Go to next Option
          $focusOn = $current.next();
          if ($focusOn.length === 0) {
            // Wrap around
            $focusOn = $alternatives.first();
          }
          break;
      }

      if ($focusOn && $focusOn.length === 1) {
        disableTab($alternatives);
        enableTab($focusOn);
        $focusOn.focus();
        event.preventDefault();
      }
    });
  };

  /**
   * Initialize module.
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   * @returns {Object} GoalsAssessmentPage GoalsAssessmentPage instance
   */
  function GoalsAssessmentPage(params, id, extras) {
    EventDispatcher.call(this);
    this.id = id;
    this.extras = extras;

    // Set default behavior.
    this.params = $.extend({
      title: this.getTitle(),
      a11yFriendlyTitle: this.getTitle(false),
      description: '',
      lowRating: 'Learned little',
      midRating: 'Learned something',
      highRating: 'Learned a lot',
      noGoalsText: 'You have not chosen any goals yet.',
      helpTextLabel: 'Read more',
      helpText: 'Help text',
      legendHeader: 'Possible ratings:',
      goalHeader: 'Goals',
      ratingHeader: 'Rating'
    }, params);

    // Array containing assessment categories,
    // makes it easier to extend categories at a later point.
    this.assessmentCategories = [
      this.params.lowRating,
      this.params.midRating,
      this.params.highRating
    ];

    this.currentGoals = [];
    this.state = {};
    this.currentSelection;
  }

  GoalsAssessmentPage.prototype = Object.create(EventDispatcher.prototype);
  GoalsAssessmentPage.prototype.constructor = GoalsAssessmentPage;

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} $container The container which will be appended to.
   */
  GoalsAssessmentPage.prototype.attach = function ($container) {
    var self = this;
    self.$inner = $('<div>', {
      'class': MAIN_CONTAINER
    }).appendTo($container);

    self.$pageTitle = $('<div>', {
      'class': 'page-header',
      role: 'heading',
      tabindex: -1,
      'aria-label': self.params.a11yFriendlyTitle,
      append: $('<div>', {
        class: 'page-title',
        html: self.params.title
      }),
      appendTo: self.$inner
    });

    if (self.params.helpText !== undefined && self.params.helpText.length !== 0) {
      self.$helpButton = $('<button>', {
        'class': 'page-help-text',
        html: self.params.helpTextLabel,
        click: function () {
          self.trigger('open-help-dialog', {
            title: self.params.title,
            helpText: self.params.helpText
          });
        },
        appendTo: self.$pageTitle
      });
    }

    $('<div>', {
      class: 'goals-assessment-description',
      html: self.params.description,
      appendTo: self.$inner
    });

    const $legend = $('<div>', {
      class: 'legend',
      'aria-hidden': true,
      appendTo: self.$inner
    });

    $('<span>', {
      class: 'legend-header',
      html: self.params.legendHeader,
      appendTo: $legend
    });

    $('<ul>', {
      class: 'ratings',
      append: [
        $('<li>', {
          class: 'rating low',
          html: self.params.lowRating
        }),
        $('<li>', {
          class: 'rating mid',
          html: self.params.midRating
        }),
        $('<li>', {
          class: 'rating high',
          html: self.params.highRating
        })
      ],
      appendTo: $legend
    });

    const $goalsAssessmentView = $('<div>', {
      class: 'goals-assessment-view',
      appendTo: self.$inner
    });

    const goalsHeaderId = H5P.createUUID();

    self.$goalsHeader = $('<div>', {
      class: 'goals-header',
      appendTo: $goalsAssessmentView
    });

    $('<span>', {
      class: 'goal-name-header',
      html: self.params.goalHeader,
      appendTo: self.$goalsHeader,
      id: goalsHeaderId
    });

    $('<span>', {
      class: 'rating-header',
      html: self.params.ratingHeader,
      'aria-hidden': 'true',
      appendTo: self.$goalsHeader
    });

    self.$goals = $('<ul>', {
      class: 'goals',
      'aria-labelledby': goalsHeaderId,
      role: 'list' // Some screen readers expect explicit role to read label
    });

    $('<div>', {
      class: 'rating-header',
      html: self.$goals,
      appendTo: $goalsAssessmentView
    });
  };

  /**
   * Get page title
   * @param {boolean} turncatedTitle turncate title flag
   * @returns {String} page title
   */
  GoalsAssessmentPage.prototype.getTitle = function (turncatedTitle = true) {
    const pageTitle = (this.extras && this.extras.metadata && this.extras.metadata.title) ? this.extras.metadata.title : 'Goals Assessment';
    return turncatedTitle ? H5P.createTitle(pageTitle) : pageTitle;
  };

  /**
   * Updates internal list of assessment goals
   *
   * @param {Array} newGoals Array of goals
   */
  GoalsAssessmentPage.prototype.updateAssessmentGoals = function (newGoals) {
    var self = this;

    this.currentGoals = [];
    this.$goals.empty();

    // Create and place all goals
    newGoals.forEach(function (goalsPage) {
      goalsPage.forEach(function (goalInstance) {
        self.createGoalAssessmentElement(goalInstance);
      });
    });

    self.trigger('resize');
  };

  /**
   * Create goal assessment element from goal instance
   * @param {H5P.GoalsPage.GoalInstance} goalInstance Goal instance
   */
  GoalsAssessmentPage.prototype.createGoalAssessmentElement = function (goalInstance) {
    var self = this;
    var goalText = goalInstance.goalText();
    // Check if goal is defined
    if (!goalText) {
      return;
    }

    self.currentGoals.push(goalInstance);

    const goalId = H5P.createUUID();

    var $goal = $('<li>', {
      class: 'goal',
      appendTo: self.$goals
    });

    $('<span>', {
      class: 'goal-name',
      text: goalText,
      appendTo: $goal,
      id: goalId
    });

    const $ratingContainer = $('<ul>', {
      'role': 'radiogroup',
      class: 'rating-container',
      'aria-labelledby': goalId,
      appendTo: $goal
    });

    $('<li>', {
      role: 'radio',
      class: 'rating low',
      'aria-label': `${self.params.ratingHeader}: ${self.params.lowRating}`,
      appendTo: $ratingContainer
    });

    $('<li>', {
      role: 'radio',
      class: 'rating mid',
      'aria-label': `${self.params.ratingHeader}: ${self.params.midRating}`,
      appendTo: $ratingContainer
    });

    $('<li>', {
      role: 'radio',
      class: 'rating high',
      'aria-label': `${self.params.ratingHeader}: ${self.params.highRating}`,
      appendTo: $ratingContainer
    });

    // Setup buttons
    var $ratingButtons = $goal.find('[role="radio"]');
    makeRadiosAccessible($ratingButtons);
    H5P.DocumentationTool.handleButtonClick($ratingButtons, function () {
      var $currentElement = $(this);

      uncheck($ratingButtons);
      check($currentElement);

      var selectedCategoryIndex = $currentElement.index();
      // Save answer
      goalInstance.goalAnswer(selectedCategoryIndex);
      goalInstance.setTextualAnswer(self.assessmentCategories[selectedCategoryIndex]);

      var xAPIEvent = self.createXAPIEventTemplate('interacted');
      self.addQuestionToGoalXAPI(xAPIEvent, goalText);
      self.addResponseToGoalXAPI(xAPIEvent, $currentElement.index());
      self.trigger(xAPIEvent);
    });

    // If already checked - update UI
    if (goalInstance.goalAnswer() !== -1) {
      check($ratingButtons.eq(goalInstance.goalAnswer()));
    }
  };

  /**
   * Gets current updated goals
   *
   * @returns {Object} current goals and assessment categories
   */
  GoalsAssessmentPage.prototype.getAssessedGoals = function () {
    return {
      goals: this.currentGoals,
      categories: this.assessmentCategories
    };
  };

  /**
   * Sets focus on page
   */
  GoalsAssessmentPage.prototype.focus = function () {
    this.$pageTitle.focus();
  };

  /**
   * Triggers an 'answered' xAPI event for all inputs
   */
  GoalsAssessmentPage.prototype.triggerAnsweredEvents = function () {
    var self = this;
    this.getAssessedGoals().goals.forEach(function(goal) {
      var xAPIEvent = self.createXAPIEventTemplate('answered');
      self.addQuestionToGoalXAPI(xAPIEvent, goal.text);
      self.addResponseToGoalXAPI(xAPIEvent, goal.answer);
      self.trigger(xAPIEvent);
    });
  };

  /**
   * Helper function to return all xAPI data
   * @returns {Array}
   */
  GoalsAssessmentPage.prototype.getXAPIDataFromChildren = function () {
    var children = [];

    var self = this;
    this.getAssessedGoals().goals.forEach(function(goal) {
      var xAPIEvent = self.createXAPIEventTemplate('answered');
      self.addQuestionToGoalXAPI(xAPIEvent, goal.text);
      self.addResponseToGoalXAPI(xAPIEvent, goal.answer);
      children.push({
        statement: xAPIEvent.data.statement
      });
    });

    return children;
  };

  /**
   * Generate xAPI object definition used in xAPI statements for the entire goals assessment page
   * @return {Object}
   */
  GoalsAssessmentPage.prototype.getxAPIDefinition = function () {
    var definition = {};
    var self = this;
    definition.interactionType = 'compound';
    definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
    definition.description = {
      'en-US': self.params.title
    };
    definition.extensions = {
      'https://h5p.org/x-api/h5p-machine-name': 'H5P.GoalsAssessmentPage'
    };

    return definition;
  };

  /**
   * Generate xAPI object definition used in xAPI statements for each goal
   * @param {string} goalText Title of the goal
   * @return {Object}
   */
  GoalsAssessmentPage.prototype.getGoalXAPIDefinition = function (goalText) {
    var definition = {};
    var self = this;

    var choices = self.assessmentCategories.map(function(alt, i) {
      return {
        id: '' + i,
        description: {
          'en-US': alt // We don't actually know the language at runtime
        }
      };
    });

    definition.interactionType = 'choice';
    definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
    definition.description = {
      'en-US': goalText
    };
    definition.choices = choices;

    return definition;
  };

  /**
   * Add the question itself to the definition part of an xAPIEvent
   */
  GoalsAssessmentPage.prototype.addQuestionToXAPI = function (xAPIEvent) {
    var definition = xAPIEvent.getVerifiedStatementValue(['object', 'definition']);
    $.extend(definition, this.getxAPIDefinition());
  };

  /**
   * Add the question itself to the definition part of an xAPIEvent for a goal
   * @param {string} goal The goal title
   */
  GoalsAssessmentPage.prototype.addQuestionToGoalXAPI = function (xAPIEvent, goalText) {
    var definition = xAPIEvent.getVerifiedStatementValue(['object', 'definition']);
    $.extend(definition, this.getGoalXAPIDefinition(goalText));
  };

  /**
   * Add the response part to an xAPI event for each goal
   *
   * @param {H5P.XAPIEvent} xAPIEvent
   *  The xAPI event we will add a response to
   * @param {number} answer The response
   */
  GoalsAssessmentPage.prototype.addResponseToGoalXAPI = function (xAPIEvent, answer) {
    xAPIEvent.data.statement.result = {}; // Convert to a string
    xAPIEvent.data.statement.result.response = answer + ''; // Convert to a string
  };

  /**
   * Get xAPI data.
   * Contract used by report rendering engine.
   *
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
   */
  GoalsAssessmentPage.prototype.getXAPIData = function () {
    var xAPIEvent = this.createXAPIEventTemplate('answered');
    this.addQuestionToXAPI(xAPIEvent);
    return {
      statement: xAPIEvent.data.statement,
      children: this.getXAPIDataFromChildren()
    };
  };

  return GoalsAssessmentPage;
}(H5P.jQuery, H5P.EventDispatcher));
