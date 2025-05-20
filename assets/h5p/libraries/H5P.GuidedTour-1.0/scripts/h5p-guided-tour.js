var H5P = H5P || {};

/**
 * H5P Guided tour library.
 *
 * This is a utility library, which does not implement attach. I.e, it has to bee actively used by
 * other libraries
 *
 * @module
 */
H5P.GuidedTour = (function ($) {

  /**
   * @type {Object}
   * @enum
   */
  var STEP_TYPES = {
    FIRST: 0,
    IN_BETWEEN: 1,
    LAST: 2,
    SINGLE: 3
  };

  /**
   * A class representing a step
   *
   * @class Step
   * @private
   * @param  {Object} options
   * @param  {number} stepType
   * @param  {H5P.Sheperd.Tour} tour
   * @param  {Object} highlight Object containing css-properties that will be
   * @param  {Object} labels Labels for buttons
   * applied to current guided element (used if highlightElement === true)
   */
  function Step(options, stepType, tour, highlight, labels) {
    var self = this;
    options.classes = options.classes || '';
    options.classes += ' h5p shepherd-theme-arrows';

    // ************
    // First button
    // ************
    options.buttons = [];
    if (stepType === STEP_TYPES.FIRST) {
      // First step - exit button
      options.buttons.push({
        text: labels.exit,
        classes: 'shepherd-button-secondary',
        action: tour.cancel
      });

      options.classes += ' first';
    }
    else if (stepType !== STEP_TYPES.SINGLE) {
      // All others - back button
      options.buttons.push({
        text: labels.back,
        classes: 'shepherd-button-secondary',
        action: tour.back
      });
    }

    // *************
    // Second button
    // *************
    if (stepType === STEP_TYPES.LAST || stepType === STEP_TYPES.SINGLE) {
      // Last step - finish button
      options.buttons.push({
        text: labels.done,
        action: tour.complete,
        classes: 'shepherd-button-primary'
      });

      options.classes += ' last';
    }
    else {
      // All others - next button
      options.buttons.push({
        text: labels.next,
        action: tour.next,
        classes: 'shepherd-button-primary'
      });
    }

    var $element;
    options.when = {
      show: function () {
        if (options.highlightElement) {
          $element = $element || $(options.attachTo.element);
          $element.css(highlight);
        }
        // Stop propagating click events, so that body don't get them
        var el = this.el;
        setTimeout(function () {
          $(el).on('click.guided-tour', function () {
            return false;
          });
        }, 0);
      },
      hide: function () {
        if (options.highlightElement) {
          $element = $element || $(options.attachTo.element);
          for (var property in highlight) {
            $element.css(property, '');
          }
        }
        var el = this.el;
        setTimeout(function () {
          $(el).off('click.guided-tour');
        }, 0);
      }
    };

    if (options.noArrow) {
      options.classes += ' h5p-guided-tour-step-no-arrow';
    }

    /**
     * Return options needed by Shepherd
     * @method getOptions
     * @return {Object}
     */
    self.getOptions = function () {
      return options;
    };
  }

  // Reference to localStorage if present. If not, just a dummy object:
  const localStorage = window.localStorage || {
    setItem: function (key, value) {},
    getItem: function (key) {
      return null;
    }
  };

  // Object responsible for storing/getting which guides have been seen
  const storage = {
    get: function (key, next) {
      // Get value from browser storage
      if (localStorage.getItem(key) !== null) {
        return next(true);
      }

      // If not found in localstorage, try to get a value from user data storage
      try {
        H5P.getUserData(0, key, function (err, result) {
          if (!err) {
            // Cache it in localStorage:
            localStorage.setItem(key, result);
            return next(result);
          }
          next(false);
        });
      }
      catch (err) {
        next(false);
      }
    },
    set: function (key, value) {
      // Store in browser
      localStorage.setItem(key, value);

      // Try to store in user data storage
      try {
        H5P.setUserData(0, key, value);
      }
      catch (err) { /* Suppress error messages */ }
    },
  };
  
  /**
   * Main class
   * @class H5P.GuidedTour
   * @param  {Array}   steps   Array of step objects
   * @param  {Object}  options Options
   */
  function GuidedTour(steps, options) {
    var self = this;

    options = $.extend({}, {
      highlight: {
        background: '#3288e6',
        color: '#fff'
      },
      labels: {
        exit: 'Exit',
        done: 'Done',
        back: 'Back',
        next: 'Next'
      }
    }, options);

    var tour = new H5P.Shepherd.Tour({
      defaults: {
        showCancelLink: true
      }
    });

    for (var i = 0, numSteps = steps.length; i < steps.length; i++ ) {
      var type = numSteps === 1 ? STEP_TYPES.SINGLE : (i === 0 ? STEP_TYPES.FIRST : (i+1 === numSteps ? STEP_TYPES.LAST : STEP_TYPES.IN_BETWEEN));
      tour.addStep((new Step(steps[i], type, tour, options.highlight, options.labels)).getOptions());
    }

    /**
     * Start the guided tour
     * @method start
     * @memberof H5P.GuidedTour
     * @return {boolean} Shown or not
     */
    self.start = function (force, started) {

      // Check if first element in tour exists:
      if (steps.length !== 0 && steps[0].attachTo && $(steps[0].attachTo.element).length === 0) {
        return;
      }

      var start = function () {
        // Remember the user has seen this guide
        self.setTourSeen();

        $('body').off('click.guided-tour');

        try {
          tour.start();
        }
        catch (err) { /* Suppress error messages / Missing tour elements */ }

        // Listen for click-events on body, so we can hide the guide:
        $('body').on('click.guided-tour', function () {
          tour.hide();
        });

        tour.on('complete', function () {
          $('body').off('click.guided-tour');
        });

        started();
      };

      if (force) {
        start();
      }
      else {
        self.ifTourHasNotBeenSeen(start);
      }
    };

    /**
     * Hides guide
     * @method hide
     * @memberof H5P.GuidedTour
     */
    self.hide = function () {
      tour.hide();
    };

    /**
     * Destroys tour, i.e removes DOM elements and event listeners
     */
    self.destroy = function () {
      self.hide();
      $('body').off('click.guided-tour');
      for (var i = 0; i < tour.steps.length; i++) {
        var step = tour.steps[i];
        step && step.destroy();
      }
    };

    /**
     * Tells if tour is open or not
     * @method isOpen
     * @return {Boolean}
     * @memberof H5P.GuidedTour
     */
    self.isOpen = function () {
      var currentStep = tour.getCurrentStep();
      return currentStep !== undefined && currentStep.isOpen();
    };

    /**
     * Mark this tour as seen. This is persisted using localstorage. If not present, nothing is persisted.
     *
     * @method setTourSeen
     * @memberof H5P.GuidedTour
     */
    self.setTourSeen = function () {
      storage.set(options.id + '-seen', true);
    };

    /**
     * Check if this tour has been seen by user. Reads value from localstorage
     *
     * @method hasTourBeenSeen
     * @memberof H5P.GuidedTour
     * @return {Boolean}
     */
    self.ifTourHasNotBeenSeen = function (action) {
      storage.get(options.id + '-seen', function (value) {
        if (value !== true) {
          action();
        }
      });
    };
  }

  return GuidedTour;
})(H5P.jQuery);
