var H5P = H5P || {};

/**
 * Standard Page module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.StandardPage = (function ($, EventDispatcher) {
  "use strict";

  // CSS Classes:
  var MAIN_CONTAINER = 'h5p-standard-page';

  /**
   * Initialize module.
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   * @param {object} [extras] Saved state, metadata, etc.
   * @returns {Object} StandardPage StandardPage instance
   */
  function StandardPage(params, id, extras) {
    EventDispatcher.call(this);

    this.$ = $(this);
    this.id = id;
    this.extras = extras;

    // Set default behavior.
    this.params = $.extend({
      title: this.getTitle(),
      a11yFriendlyTitle: this.getTitle(false),
      elementList: [],
      helpTextLabel: 'Read more',
      helpText: 'Help text'
    }, params);

    if (extras !== undefined && extras.previousState !== null && typeof extras.previousState === 'object' && Object.keys(extras.previousState).length) {
      this.previousState = extras.previousState;
    }
  }

  // Setting up inheritance
  StandardPage.prototype = Object.create(EventDispatcher.prototype);
  StandardPage.prototype.constructor = StandardPage;

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} $container The container which will be appended to.
   */
  StandardPage.prototype.attach = function ($container) {
    var self = this;

    this.$inner = $('<div>', {
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

    this.pageInstances = [];

    this.params.elementList.forEach(function (element, index) {
      var $elementContainer = $('<div>', {
        'class': 'h5p-standard-page-element'
      }).appendTo(self.$inner);

      const childExtras = {}
      if (self.previousState && self.previousState.childrenStates[index]) {
        childExtras.previousState = self.previousState.childrenStates[index];
      }

      var elementInstance = H5P.newRunnable(
        element,
        self.id,
        undefined,
        true,
        childExtras
      );

      elementInstance.on('loaded', function () {
        self.trigger('resize');
      });

      elementInstance.on('resize', function () {
        self.parent.trigger('resize');
      });

      elementInstance.attach($elementContainer);

      self.pageInstances.push(elementInstance);
    });
  };

  /**
   * Retrieves input array.
   */
  StandardPage.prototype.getInputArray = function () {
    var inputArray = [];
    this.pageInstances.forEach(function (elementInstance) {
      if (elementInstance.libraryInfo.machineName === 'H5P.TextInputField') {
        inputArray.push(elementInstance.getInput());
      }
    });

    return inputArray;
  };

  /**
   * Returns True if all required inputs are filled.
   * @returns {boolean} True if all required inputs are filled.
   */
  StandardPage.prototype.requiredInputsIsFilled = function () {
    var requiredInputsIsFilled = true;
    this.pageInstances.forEach(function (elementInstance) {
      if (elementInstance.libraryInfo.machineName === 'H5P.TextInputField') {
        if (!elementInstance.isRequiredInputFilled()) {
          requiredInputsIsFilled = false;
        }
      }
    });

    return requiredInputsIsFilled;
  };

  /**
   * Mark required input fields.
   */
  StandardPage.prototype.markRequiredInputFields = function () {
    this.pageInstances.forEach(function (elementInstance) {
      if (elementInstance.libraryInfo.machineName === 'H5P.TextInputField') {
        if (!elementInstance.isRequiredInputFilled()) {
          elementInstance.markEmptyField();
        }
      }
    });
  };

  /**
   * Sets focus on page
   */
  StandardPage.prototype.focus = function () {
    this.$pageTitle.focus();
  };

  /**
   * Get page title
   * @param {boolean} turncatedTitle turncate title flag
   * @returns {String} page title
   */
  StandardPage.prototype.getTitle = function (turncatedTitle = true) {
    const pageTitle = (this.extras && this.extras.metadata && this.extras.metadata.title) ? this.extras.metadata.title : 'Instructions';
    return turncatedTitle ? H5P.createTitle(pageTitle) : pageTitle;
  };

  /**
   * Triggers an 'answered' xAPI event for all inputs
   */
  StandardPage.prototype.triggerAnsweredEvents = function () {
    this.pageInstances.forEach(function (elementInstance) {
      if (elementInstance.triggerAnsweredEvent) {
        elementInstance.triggerAnsweredEvent();
      }
    });
  };

  /**
   * Helper function to return all xAPI data
   * @returns {Array}
   */
  StandardPage.prototype.getXAPIDataFromChildren = function () {
    var children = [];

    this.pageInstances.forEach(function (elementInstance) {
      if (elementInstance.getXAPIData) {
        children.push(elementInstance.getXAPIData());
      }
    });

    return children;
  };

  /**
   * Generate xAPI object definition used in xAPI statements.
   * @return {Object}
   */
  StandardPage.prototype.getxAPIDefinition = function () {
    var definition = {};
    var self = this;

    definition.interactionType = 'compound';
    definition.type = 'http://adlnet.gov/expapi/activities/cmi.interaction';
    definition.description = {
      'en-US': self.params.title
    };
    definition.extensions = {
      'https://h5p.org/x-api/h5p-machine-name': 'H5P.StandardPage'
    };

    return definition;
  };

  /**
   * Add the question itself to the definition part of an xAPIEvent
   */
  StandardPage.prototype.addQuestionToXAPI = function (xAPIEvent) {
    var definition = xAPIEvent.getVerifiedStatementValue(['object', 'definition']);
    $.extend(definition, this.getxAPIDefinition());
  };

  /**
   * Get xAPI data.
   * Contract used by report rendering engine.
   *
   * @see contract at {@link https://h5p.org/documentation/developers/contracts#guides-header-6}
   */
  StandardPage.prototype.getXAPIData = function () {
    var xAPIEvent = this.createXAPIEventTemplate('answered');
    this.addQuestionToXAPI(xAPIEvent);
    return {
      statement: xAPIEvent.data.statement,
      children: this.getXAPIDataFromChildren()
    };
  };

  /**
   * Answer call to return the current state.
   *
   * @return {object} Current state.
   */
  StandardPage.prototype.getCurrentState = function () {
    const childrenStates = this.pageInstances.map(function (instance) {
      return (typeof instance.getCurrentState === 'function') ?
        instance.getCurrentState() :
        undefined;
    });

    return {
      childrenStates: childrenStates
    };
  };

  StandardPage.prototype.resetTask = function() {
    this.pageInstances.map(function (instance) {
      typeof instance.resetTask === 'function' && instance.resetTask();
    });
  };

  return StandardPage;
}(H5P.jQuery, H5P.EventDispatcher));
